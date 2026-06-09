package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Locale;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
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
import woorifisa.project.backend.domain.user.dto.request.UpdateUserRequest;
import woorifisa.project.backend.domain.user.dto.response.CorrectionDocumentResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.Resume;
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

	private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,16}$");
	private static final Set<String> SUPPORTED_LANGUAGES = Set.of("vi", "fr", "en", "ja", "pt", "zh", "ko", "ne", "ru");

	private final UserRepository userRepository;
	private final DocumentRepository documentRepository;
	private final UserDocumentS3Uploader userDocumentS3Uploader;
	private final PortfolioFileS3Uploader portfolioFileS3Uploader;
	private final ResumeRepository resumeRepository;
	private final PasswordEncoder passwordEncoder;
	private final NotificationService notificationService;

	@Transactional
	public void updateUser(Long userId, UpdateUserRequest request, List<MultipartFile> portfolioFiles) {
		// 전달된 항목만 선택적으로 처리한다. 언어는 DB에 저장하지 않고 컨트롤러에서 쿠키만 갱신한다.
		validateUpdateTarget(request, portfolioFiles);
		validateLanguage(request.language());
		validatePasswordChangeFields(request);
		log.info(
			"회원 정보 수정 처리 시작: userId={}, languageChange={}, passwordChange={}, portfolioDelete={}, portfolioUploadCount={}",
			userId,
			!isBlank(request.language()),
			isPasswordChangeRequested(request),
			request.deletePortfolioId() != null,
			uploadedPortfolioFiles(portfolioFiles).size()
		);

		// 언어만 변경하는 요청은 회원 원장성 데이터 조회가 필요 없다.
		User user = null;
		if (needsUser(request, portfolioFiles)) {
			user = userRepository.findById(userId)
				.orElseThrow(() -> new CustomException(USER_NOT_FOUND));
		}

		if (isPasswordChangeRequested(request)) {
			changePassword(user, request);
		}

		// 포트폴리오는 삭제 후 등록 순서로 처리해 하나의 요청 안에서 교체할 수 있게 한다.
		if (request.deletePortfolioId() != null) {
			deletePortfolio(user, request.deletePortfolioId());
		}

		for (MultipartFile portfolioFile : uploadedPortfolioFiles(portfolioFiles)) {
			uploadPortfolio(user, portfolioFile);
		}
		log.info("회원 정보 수정 처리 완료: userId={}", userId);
	}

	private void validateUpdateTarget(UpdateUserRequest request, List<MultipartFile> portfolioFiles) {
		// 빈 multipart 요청은 실수 가능성이 높으므로 명시적으로 실패시킨다.
		if (request == null || (
			isBlank(request.language())
				&& isBlank(request.currentPassword())
				&& isBlank(request.newPassword())
				&& isBlank(request.newPasswordConfirm())
				&& request.deletePortfolioId() == null
				&& uploadedPortfolioFiles(portfolioFiles).isEmpty()
		)) {
			throw new CustomException(USER_UPDATE_TARGET_REQUIRED);
		}
	}

	private void validateLanguage(String language) {
		// 지원 언어 검증만 수행하고, 저장 위치는 NOVA_LANGUAGE 쿠키로 한정한다.
		if (isBlank(language)) {
			return;
		}
		if (!SUPPORTED_LANGUAGES.contains(language.trim().toLowerCase(Locale.ROOT))) {
			throw new CustomException(INVALID_LANGUAGE_CODE);
		}
	}

	// 실제 회원 엔티티가 필요한 변경 항목인지 판단해 불필요한 DB 접근을 줄인다.
	// 비밀번호 변경 요청이 있거나, 포트폴리오 삭제 요청이 있거나, 포트폴리오 등록 파일이 있으면 User 엔티티가 필요하다.
	private boolean needsUser(UpdateUserRequest request, List<MultipartFile> portfolioFiles) {
		return isPasswordChangeRequested(request)
			|| request.deletePortfolioId() != null
			|| !uploadedPortfolioFiles(portfolioFiles).isEmpty();
	}

	// 비밀번호 변경은 선택 항목이지만, 변경을 시도한 경우에는 세 필드가 모두 필요하다.
	// 아래 메서드 2개 조합해서 아예 안 보낸 건 괜찮고, 일부만 보낸 건 안 되는 것을 확인
	private void validatePasswordChangeFields(UpdateUserRequest request) {
		if (isPasswordChangeRequested(request) && hasIncompletePasswordFields(request)) {
			throw new CustomException(USER_PASSWORD_CHANGE_FIELDS_REQUIRED);
		}
	}

	// 비밀번호 변경을 하려는 시도가 있는지 확인
	private boolean isPasswordChangeRequested(UpdateUserRequest request) {
		return !isBlank(request.currentPassword())
			|| !isBlank(request.newPassword())
			|| !isBlank(request.newPasswordConfirm());
	}

	// 비밀번호 변경에 필요한 값 중 하나라도 비어있는지 확인
	private boolean hasIncompletePasswordFields(UpdateUserRequest request) {
		return isBlank(request.currentPassword()) || isBlank(request.newPassword()) || isBlank(request.newPasswordConfirm());
	}



	private void changePassword(User user, UpdateUserRequest request) {
		// 현재 비밀번호 확인과 새 비밀번호 정책은 기존 인증 규칙을 재사용한다.
		if (!PASSWORD_PATTERN.matcher(request.newPassword()).matches()) {
			throw new CustomException(INVALID_PASSWORD_FORMAT);
		}
		if (!request.newPassword().equals(request.newPasswordConfirm())) {
			throw new CustomException(PASSWORD_CONFIRM_NOT_MATCHED);
		}
		if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
			throw new CustomException(PASSWORD_NOT_MATCHED);
		}
		user.changePassword(passwordEncoder.encode(request.newPassword()));
	}


	private void deletePortfolio(User user, Long portfolioId) {
		// 본인 소유 Resume만 S3 객체와 DB row를 함께 삭제할 수 있다.
		Resume resume = resumeRepository.findById(portfolioId)
			.filter(candidate -> Objects.equals(candidate.getUser().getUserId(), user.getUserId()))
			.orElseThrow(() -> new CustomException(PORTFOLIO_NOT_FOUND));

		portfolioFileS3Uploader.deleteByUrl(resume.getUrl());
		resumeRepository.delete(resume);
	}

	private void uploadPortfolio(User user, MultipartFile portfolioFile) {
		String fileUrl = portfolioFileS3Uploader.uploadProfile(user.getUserId(), portfolioFile);
		Resume resume = Resume.builder()
			.user(user)
			.name(resolvePortfolioName(portfolioFile))
			.url(fileUrl)
			.build();
		resumeRepository.save(resume);
	}

	private String resolvePortfolioName(MultipartFile file) {
		String filename = file.getOriginalFilename();
		return isBlank(filename) ? "portfolio" : filename.trim();
	}

	private List<MultipartFile> uploadedPortfolioFiles(List<MultipartFile> portfolioFiles) {
		// 파일 파트가 없거나 비어 있을 수 있어 실제 업로드 파일만 정규화한다.
		if (portfolioFiles == null) {
			return List.of();
		}
		return portfolioFiles.stream()
			.filter(this::isUploadedFile)
			.toList();
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
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
