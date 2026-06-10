package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.CompareFacesRequest;
import software.amazon.awssdk.services.rekognition.model.CompareFacesResponse;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionRequest;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionRequestSettings;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionResponse;
import software.amazon.awssdk.services.rekognition.model.GetFaceLivenessSessionResultsRequest;
import software.amazon.awssdk.services.rekognition.model.GetFaceLivenessSessionResultsResponse;
import software.amazon.awssdk.services.rekognition.model.Image;
import software.amazon.awssdk.services.rekognition.model.LivenessOutputConfig;
import software.amazon.awssdk.services.rekognition.model.S3Object;
import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.response.CorrectionDocumentResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.domain.user.dto.response.UserProfileResponse;
import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.ResumeRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.config.KycRekognitionProperties;
import woorifisa.project.backend.global.exception.CustomException;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final DocumentRepository documentRepository;
	private final ResumeRepository resumeRepository;
	private final UserDocumentS3Uploader userDocumentS3Uploader;
	private final NotificationService notificationService;

	@Transactional(readOnly = true)
	public UserProfileResponse getUserProfile(Long userId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));

		return UserProfileResponse.from(user, resumeRepository.findByUserOrderByResumeIdDesc(user));
	}

	@Transactional
	public void requestCertificateIssuance(Long userId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));

		user.startCertificateIssuance();
	}

	@Transactional
	public void uploadDocuments(
		Long userId,
		MultipartFile residenceVerificationPdf,
		MultipartFile alienRegistrationApplicationPdf
	) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));

		boolean hasUploadHistory = documentRepository.existsByUser(user);  // 서류를 제출한 사용자인지 확인
		if (!hasUploadHistory) {
			// 문서(외국인 등록증 신청서, 거소 확인서)를 처음 등록하는 경우
			uploadInitialDocuments(user, residenceVerificationPdf, alienRegistrationApplicationPdf);
			return;
		}

		// 문서를 보완해야하는 경우(다시 제출하는 경우)
			uploadCorrectionDocuments(user, residenceVerificationPdf, alienRegistrationApplicationPdf);
			// 보완 서류 제출 시 보완 알림 삭제
			notificationService.deleteSupplementDocumentNotification(user);
	}

	@Transactional(readOnly = true)
	public List<CorrectionDocumentResponse> getCorrectionDocuments(Long userId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));

		return List.of(
				DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
				DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT
			).stream()
			.map(documentType -> documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, documentType)
				.filter(document -> document.getStatus() == DocumentStatus.REJECTED || document.getStatus() == DocumentStatus.APPROVED)
				.map(document -> new CorrectionDocumentResponse(
					document.getDocumentType().name(),
					document.getStatus().name(),
					parseMissingItems(document.getMissing())
				))
				.orElse(null))
			.filter(java.util.Objects::nonNull)
			.collect(Collectors.toList());
	}

	// document의 missing을 컴마(,) 단위로 파싱
	private List<String> parseMissingItems(String missing) {
		if (missing == null || missing.isBlank()) {
			return Collections.emptyList();
		}

		return Arrays.stream(missing.split(","))
			.map(String::trim)
			.filter(item -> !item.isBlank())
			.collect(Collectors.toList());
	}

	private void uploadInitialDocuments(User user, MultipartFile residenceVerificationPdf,
		MultipartFile alienRegistrationApplicationPdf) {
		// 최초 업로드
		if (!isUploadedFile(residenceVerificationPdf) || !isUploadedFile(alienRegistrationApplicationPdf)) {
			// 두 서류 중 하나라도 누락됐다면
			throw new CustomException(INITIAL_DOCUMENT_BOTH_REQUIRED);
		}

		// 대기 상태로 저장
		saveDocuments(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT, residenceVerificationPdf,
			DocumentStatus.PENDING);    // 거소 확인 서류
		saveDocuments(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT, alienRegistrationApplicationPdf,
			DocumentStatus.PENDING);    // 외국인 등록증 신청서류
	}

	private void uploadCorrectionDocuments(User user, MultipartFile residenceVerificationPdf,
		MultipartFile alienRegistrationApplicationPdf) {
		boolean residenceRejected = isLatestRejected(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT);
		boolean alienRejected = isLatestRejected(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT);
		boolean hasResidenceUpload = isUploadedFile(residenceVerificationPdf);
		boolean hasAlienUpload = isUploadedFile(alienRegistrationApplicationPdf);

		if (!hasResidenceUpload && !hasAlienUpload) {  // 두 파일 등록 실패
			throw new CustomException(REUPLOAD_TARGET_REQUIRED);
		}

		if (residenceRejected && alienRejected && (!hasResidenceUpload || !hasAlienUpload)) {
			// 둘 다 거절 됐는데 둘 중 하나만 업로드 했거나 업로드하지 않은 경우
			throw new CustomException(REUPLOAD_ALL_REJECTED_REQUIRED);
		}

		if (hasResidenceUpload) {
			// 보완해야 될 문서에 대해서 서류를 등록했는지 여부 검사
			validateRejectedTarget(residenceRejected);
			saveDocuments(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT, residenceVerificationPdf,
				DocumentStatus.MODIFIED);
		}

		if (hasAlienUpload) {
			validateRejectedTarget(alienRejected);
			saveDocuments(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT, alienRegistrationApplicationPdf,
				DocumentStatus.MODIFIED);
		}
	}

	private boolean isLatestRejected(User user, DocumentType documentType) {
		// 사용자의 서류 처리 여부
		return documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, documentType)
			.map(document -> document.getStatus() == DocumentStatus.REJECTED)
			.orElse(false);
	}

	private void validateRejectedTarget(boolean rejected) {  // 거절된 파일인지 확인
		if (!rejected) {
			throw new CustomException(REUPLOAD_ONLY_REJECTED_ALLOWED);
		}
	}

	private void saveDocuments(User user, DocumentType documentType, MultipartFile file, DocumentStatus status) {
		validatePdfFile(file);

		// 보완 문서 업로드 시 기존 반려(REJECTED) 파일을 먼저 s3에서 제거
		if (status == DocumentStatus.MODIFIED) {
			documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, documentType)
				.filter(document -> document.getStatus() == DocumentStatus.REJECTED)
				.ifPresent(document -> userDocumentS3Uploader.deleteByStatus(
					user.getUserId(),
					documentType,
					DocumentStatus.REJECTED
				));
		}

		String fileUrl = userDocumentS3Uploader.upload(user.getUserId(), file, documentType, status);  // 업로드 주소

		//  해당 유저가 이미 같은 종류의 Document를 가지고 있으면 가장 최근 Document를 가져오고, 없으면 새 Document 객체 생성
		Document document = documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, documentType)
			.orElseGet(() -> Document.builder()
				.user(user)
				.documentType(documentType)
				.fileUrl(fileUrl)
				.status(status)
				.build());

		document.updateSubmission(fileUrl, status);
		documentRepository.save(document);
	}

	private boolean isUploadedFile(MultipartFile file) {  // 서류가 없거나 빈 서류라면
		return file != null && !file.isEmpty();
	}

	private void validatePdfFile(MultipartFile file) {
		if (file == null || file.isEmpty() || !"application/pdf".equalsIgnoreCase(file.getContentType())) {
			throw new CustomException(INVALID_DOCUMENT_FILE);
		}
	}

	private static final String PASS = "PASS";
	private static final String FAIL = "FAIL";

	private final RekognitionClient rekognitionClient;
	private final KycRekognitionProperties kycRekognitionProperties;

	public LivenessSessionResponse createLivenessSession(Long userId) {
		KycRekognitionProperties.Rekognition rekognition = kycRekognitionProperties.rekognition();
		if (rekognition == null || rekognition.outputBucket() == null || rekognition.outputBucket().isBlank()) {
			throw new CustomException(KYC_OUTPUT_BUCKET_NOT_CONFIGURED);
		}
		String clientRequestToken = UUID.randomUUID().toString();

		CreateFaceLivenessSessionRequestSettings settings = CreateFaceLivenessSessionRequestSettings.builder()
			.outputConfig(
				LivenessOutputConfig.builder()
					.s3Bucket(rekognition.outputBucket())
					.s3KeyPrefix(rekognition.outputPrefix())
					.build()
			)
			.auditImagesLimit(rekognition.auditImagesLimit())
			.build();

		CreateFaceLivenessSessionRequest sessionRequest = CreateFaceLivenessSessionRequest.builder()
			.clientRequestToken(clientRequestToken)
			.settings(settings)
			.build();

		CreateFaceLivenessSessionResponse response = rekognitionClient.createFaceLivenessSession(sessionRequest);
		log.info("liveness session created. userId={}, sessionId={}", userId, response.sessionId());

		return new LivenessSessionResponse(
			response.sessionId(),
			Instant.now().plusSeconds(180)
		);
	}

	public LivenessVerificationResponse getLivenessResult(Long userId, String sessionId) {
		GetFaceLivenessSessionResultsResponse response = getLivenessSessionResults(sessionId);

		float confidence = response.confidence() == null ? 0f : response.confidence();
		float threshold = livenessThreshold();
		String decision =
			confidence >= threshold && response.statusAsString().equalsIgnoreCase("SUCCEEDED") ? PASS : FAIL;
		String reasonCode = decision.equals(PASS) ? "LIVENESS_PASSED" : "LOW_LIVENESS_SCORE";

		log.info("liveness evaluated. userId={}, sessionId={}, status={}, confidence={}, threshold={}, decision={}",
			userId, sessionId, response.statusAsString(), confidence, threshold, decision);

		return new LivenessVerificationResponse(
			sessionId,
			response.statusAsString(),
			confidence,
			decision,
			reasonCode
		);
	}

	public LivenessVerificationResponse compareFaceWithRegisteredImage(
		Long userId,
		String sessionId,
		FaceMatchRequest request
	) {
		GetFaceLivenessSessionResultsResponse livenessResult = getLivenessSessionResults(sessionId);

		if (livenessResult.referenceImage() == null || livenessResult.referenceImage().s3Object() == null) {
			throw new CustomException(LIVENESS_REFERENCE_IMAGE_NOT_FOUND);
		}

		S3Object sourceS3 = livenessResult.referenceImage().s3Object();

		CompareFacesResponse compareFacesResponse = rekognitionClient.compareFaces(
			CompareFacesRequest.builder()
				.sourceImage(
					Image.builder()
						.s3Object(
							S3Object.builder()
								.bucket(sourceS3.bucket())
								.name(sourceS3.name())
								.build()
						)
						.build()
				)
				.targetImage(
					Image.builder()
						.s3Object(
							S3Object.builder()
								.bucket(request.registeredImageBucket())
								.name(request.registeredImageKey())
								.build()
						)
						.build()
				)
				.build()
		);

		float similarity = compareFacesResponse.faceMatches().stream()
			.map(match -> match.similarity() == null ? 0f : match.similarity())
			.max(Comparator.naturalOrder())
			.orElse(0f);

		float threshold = similarityThreshold();
		String decision = similarity >= threshold ? PASS : FAIL;
		String reasonCode = decision.equals(PASS) ? "FACE_MATCH_PASSED" : "LOW_FACE_SIMILARITY";

		log.info("face match evaluated. userId={}, sessionId={}, similarity={}, threshold={}, decision={}",
			userId, sessionId, similarity, threshold, decision);

		return new LivenessVerificationResponse(sessionId, "FACE_MATCH", similarity, decision, reasonCode);
	}

	public LivenessFinalizeResponse finalizeVerification(
		Long userId,
		String sessionId,
		FaceMatchRequest request
	) {
		LivenessVerificationResponse livenessResult = getLivenessResult(userId, sessionId);
		LivenessVerificationResponse faceMatchResult = compareFaceWithRegisteredImage(userId, sessionId, request);

		boolean passed = PASS.equals(livenessResult.decision()) && PASS.equals(faceMatchResult.decision());
		String decision = passed ? PASS : FAIL;
		String reasonCode = passed ? "VERIFICATION_PASSED" : "VERIFICATION_FAILED";

		return new LivenessFinalizeResponse(
			sessionId,
			livenessResult.score(),
			faceMatchResult.score(),
			decision,
			reasonCode
		);
	}

	private GetFaceLivenessSessionResultsResponse getLivenessSessionResults(String sessionId) {
		return rekognitionClient.getFaceLivenessSessionResults(
			GetFaceLivenessSessionResultsRequest.builder()
				.sessionId(sessionId)
				.build()
		);
	}

	private float livenessThreshold() {
		KycRekognitionProperties.Rekognition rekognition = kycRekognitionProperties.rekognition();
		return rekognition.livenessThreshold() == null ? 90f : rekognition.livenessThreshold();
	}

	private float similarityThreshold() {
		KycRekognitionProperties.Rekognition rekognition = kycRekognitionProperties.rekognition();
		return rekognition.similarityThreshold() == null ? 85f : rekognition.similarityThreshold();
	}
}
