package woorifisa.project.backend.domain.user.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.AuditImage;
import software.amazon.awssdk.services.rekognition.model.CompareFacesMatch;
import software.amazon.awssdk.services.rekognition.model.CompareFacesRequest;
import software.amazon.awssdk.services.rekognition.model.CompareFacesResponse;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionRequest;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionResponse;
import software.amazon.awssdk.services.rekognition.model.GetFaceLivenessSessionResultsRequest;
import software.amazon.awssdk.services.rekognition.model.GetFaceLivenessSessionResultsResponse;
import software.amazon.awssdk.services.rekognition.model.LivenessSessionStatus;
import software.amazon.awssdk.services.rekognition.model.S3Object;
import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.request.UpdateUserRequest;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.Resume;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.ResumeRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.config.KycRekognitionProperties;
import woorifisa.project.backend.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private DocumentRepository documentRepository;

	@Mock
	private UserDocumentS3Uploader userDocumentS3Uploader;

	@Mock
	private PortfolioFileS3Uploader portfolioFileS3Uploader;

	@Mock
	private ResumeRepository resumeRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private NotificationService notificationService;

	@Mock
	private RekognitionClient rekognitionClient;

	private UserService userService;

	@BeforeEach
	void setUp() {
		KycRekognitionProperties.Rekognition rekognition = new KycRekognitionProperties.Rekognition(
			"ap-northeast-1",
			"nova-kyc-output",
			"liveness",
			90f,
			85f,
			2
		);

		KycRekognitionProperties properties = new KycRekognitionProperties(rekognition);

		userService = new UserService(
			userRepository,
			documentRepository,
			userDocumentS3Uploader,
			portfolioFileS3Uploader,
			resumeRepository,
			passwordEncoder,
			notificationService,
			rekognitionClient,
			properties
		);
	}

	@Test
	@DisplayName("회원 정보 수정 요청에 수정 항목이 없으면 예외가 발생한다")
	void updateUserRejectsEmptyTarget() {
		UpdateUserRequest request = new UpdateUserRequest(null, null, null, null, null);

		assertThatThrownBy(() -> userService.updateUser(1L, request, List.of()))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(USER_UPDATE_TARGET_REQUIRED);
	}

	@Test
	@DisplayName("비밀번호 변경 필드가 일부만 있으면 예외가 발생한다")
	void updateUserRejectsPartialPasswordFields() {
		UpdateUserRequest request = new UpdateUserRequest(null, "Password123!", "NewPassword123!", null, null);

		assertThatThrownBy(() -> userService.updateUser(1L, request, List.of()))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(USER_PASSWORD_CHANGE_FIELDS_REQUIRED);
	}

	@Test
	@DisplayName("언어 변경은 사용자 원장 정보를 조회하거나 변경하지 않는다")
	void updateUserLanguageDoesNotTouchUserLedger() {
		UpdateUserRequest request = new UpdateUserRequest("ko", null, null, null, null);

		userService.updateUser(1L, request, List.of());

		verifyNoInteractions(userRepository);
		verifyNoInteractions(resumeRepository);
		verifyNoInteractions(portfolioFileS3Uploader);
	}

	@Test
	@DisplayName("지원하지 않는 언어 코드는 예외가 발생한다")
	void updateUserRejectsInvalidLanguage() {
		UpdateUserRequest request = new UpdateUserRequest("es", null, null, null, null);

		assertThatThrownBy(() -> userService.updateUser(1L, request, List.of()))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(INVALID_LANGUAGE_CODE);
	}

	@Test
	@DisplayName("현재 비밀번호가 맞으면 새 비밀번호를 인코딩해서 저장한다")
	void updateUserChangesPassword() {
		User user = User.builder()
			.userId(1L)
			.password("encoded-current")
			.build();
		UpdateUserRequest request = new UpdateUserRequest(
			null,
			"Password123!",
			"NewPassword123!",
			"NewPassword123!",
			null
		);

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("Password123!", "encoded-current")).thenReturn(true);
		when(passwordEncoder.encode("NewPassword123!")).thenReturn("encoded-new");

		userService.updateUser(1L, request, List.of());

		assertThat(user.getPassword()).isEqualTo("encoded-new");
	}

	@Test
	@DisplayName("현재 비밀번호가 틀리면 예외가 발생한다")
	void updateUserRejectsWrongCurrentPassword() {
		User user = User.builder()
			.userId(1L)
			.password("encoded-current")
			.build();
		UpdateUserRequest request = new UpdateUserRequest(
			null,
			"WrongPassword123!",
			"NewPassword123!",
			"NewPassword123!",
			null
		);

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("WrongPassword123!", "encoded-current")).thenReturn(false);

		assertThatThrownBy(() -> userService.updateUser(1L, request, List.of()))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(PASSWORD_NOT_MATCHED);
	}

	@Test
	@DisplayName("포트폴리오 여러 개 등록 시 S3 업로드 결과 URL로 Resume을 각각 저장한다")
	void updateUserUploadsPortfolios() {
		User user = User.builder().userId(1L).build();
		UpdateUserRequest request = new UpdateUserRequest(null, null, null, null, null);
		MockMultipartFile firstPortfolio = new MockMultipartFile(
			"portfolioFiles",
			"portfolio.pdf",
			"application/pdf",
			"portfolio".getBytes()
		);
		MockMultipartFile secondPortfolio = new MockMultipartFile(
			"portfolioFiles",
			"cover.docx",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"cover".getBytes()
		);

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(portfolioFileS3Uploader.uploadProfile(1L, firstPortfolio))
			.thenReturn("https://s3.test/portfolios/user-1/profile/file.pdf");
		when(portfolioFileS3Uploader.uploadProfile(1L, secondPortfolio))
			.thenReturn("https://s3.test/portfolios/user-1/profile/cover.docx");

		userService.updateUser(1L, request, List.of(firstPortfolio, secondPortfolio));

		ArgumentCaptor<Resume> captor = ArgumentCaptor.forClass(Resume.class);
		verify(resumeRepository, times(2)).save(captor.capture());
		assertThat(captor.getAllValues())
			.extracting(Resume::getName)
			.containsExactly("portfolio.pdf", "cover.docx");
		assertThat(captor.getAllValues())
			.extracting(Resume::getUrl)
			.containsExactly(
				"https://s3.test/portfolios/user-1/profile/file.pdf",
				"https://s3.test/portfolios/user-1/profile/cover.docx"
			);
		assertThat(captor.getAllValues())
			.extracting(Resume::getUser)
			.containsExactly(user, user);
	}

	@Test
	@DisplayName("본인 소유 포트폴리오만 삭제할 수 있다")
	void updateUserDeletesOwnedPortfolio() {
		User user = User.builder().userId(1L).build();
		Resume resume = Resume.builder()
			.resumeId(3L)
			.user(user)
			.name("portfolio.pdf")
			.url("https://s3.test/portfolios/user-1/profile/file.pdf")
			.build();
		UpdateUserRequest request = new UpdateUserRequest(null, null, null, null, 3L);

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(resumeRepository.findById(3L)).thenReturn(Optional.of(resume));

		userService.updateUser(1L, request, List.of());

		verify(portfolioFileS3Uploader).deleteByUrl("https://s3.test/portfolios/user-1/profile/file.pdf");
		verify(resumeRepository).delete(resume);
	}

	@Test
	@DisplayName("다른 사용자의 포트폴리오는 삭제할 수 없다")
	void updateUserRejectsUnownedPortfolio() {
		User user = User.builder().userId(1L).build();
		User other = User.builder().userId(2L).build();
		Resume resume = Resume.builder()
			.resumeId(3L)
			.user(other)
			.name("portfolio.pdf")
			.url("https://s3.test/portfolios/user-2/profile/file.pdf")
			.build();
		UpdateUserRequest request = new UpdateUserRequest(null, null, null, null, 3L);

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(resumeRepository.findById(3L)).thenReturn(Optional.of(resume));

		assertThatThrownBy(() -> userService.updateUser(1L, request, List.of()))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(PORTFOLIO_NOT_FOUND);
	}

	@Test
	@DisplayName("인증서 발급 요청 시 사용자 상태를 PENDING으로 변경한다")
	void requestCertificateIssuanceChangesStatusToPending() {
		Long userId = 1L;
		User user = User.builder()
			.userId(userId)
			.certificateStatus(CertificateStatus.NOT_ISSUED)
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));

		userService.requestCertificateIssuance(userId);

		assertThat(user.getCertificateStatus()).isEqualTo(CertificateStatus.PENDING);
	}

	@Test
	@DisplayName("인증서 발급 요청 시 사용자가 없으면 예외가 발생한다")
	void requestCertificateIssuanceThrowsWhenUserNotFound() {
		Long userId = 1L;

		when(userRepository.findById(userId)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> userService.requestCertificateIssuance(userId))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(USER_NOT_FOUND);
	}

	@Test
	@DisplayName("최초 업로드 시 대기 상태 문서 2개를 저장한다")
	void initialUploadSuccess() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile residencePdf = new MockMultipartFile(
			"residenceVerificationPdf",
			"residence.pdf",
			"application/pdf",
			"residence".getBytes()
		);
		MockMultipartFile alienPdf = new MockMultipartFile(
			"alienRegistrationApplicationPdf",
			"alien.pdf",
			"application/pdf",
			"alien".getBytes()
		);

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(false);
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT
		)).thenReturn(Optional.empty());
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user,
			DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT
		)).thenReturn(Optional.empty());
		when(userDocumentS3Uploader.upload(
			userId,
			residencePdf,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
			DocumentStatus.PENDING
		)).thenReturn("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_PENDING.pdf");
		when(userDocumentS3Uploader.upload(
			userId,
			alienPdf,
			DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT,
			DocumentStatus.PENDING
		)).thenReturn("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_PENDING.pdf");

		userService.uploadDocuments(userId, residencePdf, alienPdf);

		ArgumentCaptor<Document> captor = ArgumentCaptor.forClass(Document.class);
		verify(documentRepository, times(2)).save(captor.capture());

		assertThat(captor.getAllValues())
			.extracting(Document::getStatus)
			.containsExactlyInAnyOrder(DocumentStatus.PENDING, DocumentStatus.PENDING);
	}

	@Test
	@DisplayName("최초 업로드는 두 파일이 모두 필요하다")
	void initialUploadRequiresBothFiles() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile residencePdf = new MockMultipartFile(
			"residenceVerificationPdf",
			"residence.pdf",
			"application/pdf",
			"residence".getBytes()
		);

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(false);

		assertThatThrownBy(() -> userService.uploadDocuments(userId, residencePdf, null))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(INITIAL_DOCUMENT_BOTH_REQUIRED);
	}

	@Test
	@DisplayName("보완 업로드는 반려된 문서만 허용한다")
	void reuploadOnlyRejectedAllowed() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile alienPdf = new MockMultipartFile(
			"alienRegistrationApplicationPdf",
			"alien.pdf",
			"application/pdf",
			"alien".getBytes()
		);

		Document latestResidence = Document.builder()
			.user(user)
			.documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.REJECTED)
			.fileUrl("old")
			.build();

		Document latestAlien = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.APPROVED)
			.fileUrl("old")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(true);
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT
		)).thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user,
			DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT
		)).thenReturn(Optional.of(latestAlien));

		assertThatThrownBy(() -> userService.uploadDocuments(userId, null, alienPdf))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(REUPLOAD_ONLY_REJECTED_ALLOWED);
	}

	@Test
	@DisplayName("두 문서가 모두 반려된 경우 두 파일 모두 필수다")
	void reuploadRequiresBothWhenBothRejected() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile residencePdf = new MockMultipartFile(
			"residenceVerificationPdf",
			"residence.pdf",
			"application/pdf",
			"residence".getBytes()
		);

		Document latestResidence = Document.builder()
			.user(user)
			.documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.REJECTED)
			.fileUrl("old")
			.build();

		Document latestAlien = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.REJECTED)
			.fileUrl("old")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(true);
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT
		)).thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user,
			DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT
		)).thenReturn(Optional.of(latestAlien));

		assertThatThrownBy(() -> userService.uploadDocuments(userId, residencePdf, null))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(REUPLOAD_ALL_REJECTED_REQUIRED);
	}

	@Test
	@DisplayName("보완 업로드 시 기존 반려 문서의 S3 객체를 삭제한 뒤 MODIFIED로 업로드한다")
	void reuploadDeletesRejectedObjectBeforeModifiedUpload() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile residencePdf = new MockMultipartFile(
			"residenceVerificationPdf",
			"residence.pdf",
			"application/pdf",
			"residence".getBytes()
		);
		MockMultipartFile alienPdf = new MockMultipartFile(
			"alienRegistrationApplicationPdf",
			"alien.pdf",
			"application/pdf",
			"alien".getBytes()
		);

		Document latestResidence = Document.builder()
			.user(user)
			.documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.REJECTED)
			.fileUrl("old")
			.build();

		Document latestAlien = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.REJECTED)
			.fileUrl("old")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(true);
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT
		)).thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user,
			DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT
		)).thenReturn(Optional.of(latestAlien));
		when(userDocumentS3Uploader.upload(
			userId,
			residencePdf,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
			DocumentStatus.MODIFIED
		)).thenReturn("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_MODIFIED.pdf");
		when(userDocumentS3Uploader.upload(
			userId,
			alienPdf,
			DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT,
			DocumentStatus.MODIFIED
		)).thenReturn("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_MODIFIED.pdf");

		userService.uploadDocuments(userId, residencePdf, alienPdf);

		verify(userDocumentS3Uploader).deleteByStatus(
			userId,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
			DocumentStatus.REJECTED
		);
			verify(userDocumentS3Uploader).deleteByStatus(
				userId,
				DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT,
				DocumentStatus.REJECTED
			);
			verify(notificationService).deleteSupplementDocumentNotification(user);
		}

	@Test
	@DisplayName("사용자를 찾을 수 없으면 예외가 발생한다")
	void userNotFound() {
		Long userId = 1L;
		MockMultipartFile residencePdf = new MockMultipartFile(
			"residenceVerificationPdf",
			"residence.pdf",
			"application/pdf",
			"residence".getBytes()
		);
		MockMultipartFile alienPdf = new MockMultipartFile(
			"alienRegistrationApplicationPdf",
			"alien.pdf",
			"application/pdf",
			"alien".getBytes()
		);

		when(userRepository.findById(userId)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> userService.uploadDocuments(userId, residencePdf, alienPdf))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(USER_NOT_FOUND);
	}

	@Test
	@DisplayName("보완 서류 조회 시 REJECTED/APPROVED 상태 문서만 반환하고 missing을 콤마 기준으로 파싱한다")
	void getCorrectionDocumentsParsesMissingItems() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		Document residenceRejected = Document.builder()
			.user(user)
			.documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.REJECTED)
			.missing("주소 항목 누락, 직업 / 직업명")
			.fileUrl("url1")
			.build();
		Document alienApproved = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.APPROVED)
			.missing(null)
			.fileUrl("url2")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT
		)).thenReturn(Optional.of(residenceRejected));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(
			user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT
		)).thenReturn(Optional.of(alienApproved));

		var result = userService.getCorrectionDocuments(userId);

		assertThat(result).hasSize(2);
		assertThat(result.get(0).documentType()).isEqualTo("RESIDENCE_VERIFICATION_DOCUMENT");
		assertThat(result.get(0).status()).isEqualTo("REJECTED");
		assertThat(result.get(0).missingItems()).containsExactly("주소 항목 누락", "직업 / 직업명");
		assertThat(result.get(1).documentType()).isEqualTo("ALIEN_REGISTRATION_SUPPORTING_DOCUMENT");
		assertThat(result.get(1).status()).isEqualTo("APPROVED");
		assertThat(result.get(1).missingItems()).isEmpty();
	}

	@Test
	@DisplayName("Liveness 세션 생성 시 sessionId를 반환한다")
	void createLivenessSessionSuccess() {
		when(rekognitionClient.createFaceLivenessSession(any(CreateFaceLivenessSessionRequest.class)))
			.thenReturn(CreateFaceLivenessSessionResponse.builder()
				.sessionId("session-123")
				.build());

		LivenessSessionResponse response = userService.createLivenessSession(1L);

		assertThat(response.sessionId()).isEqualTo("session-123");
		assertThat(response.expiresAt()).isNotNull();
	}

	@Test
	@DisplayName("Liveness 점수가 임계치 이상이면 PASS를 반환한다")
	void getLivenessResultPass() {
		when(rekognitionClient.getFaceLivenessSessionResults(any(GetFaceLivenessSessionResultsRequest.class)))
			.thenReturn(GetFaceLivenessSessionResultsResponse.builder()
				.status(LivenessSessionStatus.SUCCEEDED)
				.confidence(95f)
				.build());

		LivenessVerificationResponse response = userService.getLivenessResult(1L, "session-123");

		assertThat(response.decision()).isEqualTo("PASS");
		assertThat(response.reasonCode()).isEqualTo("LIVENESS_PASSED");
		assertThat(response.score()).isEqualTo(95f);
	}

	@Test
	@DisplayName("Liveness 참조 이미지가 없으면 동일인 비교는 예외를 던진다")
	void compareFaceThrowsWhenReferenceImageMissing() {
		when(rekognitionClient.getFaceLivenessSessionResults(any(GetFaceLivenessSessionResultsRequest.class)))
			.thenReturn(GetFaceLivenessSessionResultsResponse.builder()
				.status(LivenessSessionStatus.SUCCEEDED)
				.confidence(95f)
				.build());

		assertThatThrownBy(() -> userService.compareFaceWithRegisteredImage(
			1L,
			"session-123",
			new FaceMatchRequest("bucket", "key.jpg")
		))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(LIVENESS_REFERENCE_IMAGE_NOT_FOUND);
	}

	@Test
	@DisplayName("Liveness와 FaceMatch가 모두 통과하면 finalize는 PASS를 반환한다")
	void finalizePassWhenBothPass() {
		when(rekognitionClient.getFaceLivenessSessionResults(any(GetFaceLivenessSessionResultsRequest.class)))
			.thenReturn(GetFaceLivenessSessionResultsResponse.builder()
				.status(LivenessSessionStatus.SUCCEEDED)
				.confidence(96f)
				.referenceImage(
					AuditImage.builder()
						.s3Object(S3Object.builder()
							.bucket("nova-kyc-output")
							.name("liveness/ref.jpg")
							.build())
						.build()
				)
				.build());

		when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
			.thenReturn(CompareFacesResponse.builder()
				.faceMatches(List.of(
					CompareFacesMatch.builder()
						.similarity(90f)
						.build()
				))
				.build());

		LivenessFinalizeResponse response = userService.finalizeVerification(
			1L,
			"session-123",
			new FaceMatchRequest("bucket", "registered.jpg")
		);

		assertThat(response.decision()).isEqualTo("PASS");
		assertThat(response.reasonCode()).isEqualTo("VERIFICATION_PASSED");
		assertThat(response.livenessScore()).isEqualTo(96f);
		assertThat(response.similarityScore()).isEqualTo(90f);
	}

	@Test
	@DisplayName("KYC 버킷 설정이 비어 있으면 세션 생성 시 예외를 던진다")
	void createLivenessSessionThrowsWhenOutputBucketEmpty() {
		KycRekognitionProperties.Rekognition rekognition = new KycRekognitionProperties.Rekognition(
			"ap-northeast-1",
			"",
			"liveness",
			90f,
			85f,
			2
		);

			UserService service = new UserService(
				userRepository,
				documentRepository,
				userDocumentS3Uploader,
				portfolioFileS3Uploader,
				resumeRepository,
				passwordEncoder,
				notificationService,
				rekognitionClient,
				new KycRekognitionProperties(rekognition)
			);

		assertThatThrownBy(() -> service.createLivenessSession(1L))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(KYC_OUTPUT_BUCKET_NOT_CONFIGURED);
	}
}
