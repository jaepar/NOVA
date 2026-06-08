package woorifisa.project.backend.domain.user.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import software.amazon.awssdk.services.rekognition.RekognitionClient;
import woorifisa.project.backend.domain.user.dto.response.UserProfileResponse;
import woorifisa.project.backend.domain.user.entity.Resume;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.entity.enums.Gender;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.ResumeRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.config.KycRekognitionProperties;
import woorifisa.project.backend.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private DocumentRepository documentRepository;

	@Mock
	private ResumeRepository resumeRepository;

	@Mock
	private UserDocumentS3Uploader userDocumentS3Uploader;

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

		userService = new UserService(
			userRepository,
			documentRepository,
			resumeRepository,
			userDocumentS3Uploader,
			notificationService,
			rekognitionClient,
			new KycRekognitionProperties(rekognition)
		);
	}

	@Test
	@DisplayName("returns user profile with portfolio names")
	void getUserProfileReturnsUserInfoAndPortfolios() {
		Long userId = 1L;
		User user = User.builder()
			.userId(userId)
			.name("Minjeong Kim")
			.email("minjeong@email.com")
			.birth("2000.05.20")
			.gender(Gender.FEMALE)
			.hasResidenceCard(true)
			.certificateStatus(CertificateStatus.ISSUED)
			.build();
		Resume resume = Resume.builder()
			.resumeId(10L)
			.user(user)
			.name("nurse_resume.pdf")
			.url("https://s3.test/portfolio.pdf")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(resumeRepository.findByUserOrderByResumeIdDesc(user)).thenReturn(List.of(resume));

		UserProfileResponse response = userService.getUserProfile(userId);

		assertThat(response.name()).isEqualTo("Minjeong Kim");
		assertThat(response.email()).isEqualTo("minjeong@email.com");
		assertThat(response.birth()).isEqualTo("2000.05.20");
		assertThat(response.gender()).isEqualTo("FEMALE");
		assertThat(response.hasResidenceCard()).isTrue();
		assertThat(response.certificateStatus()).isEqualTo("ISSUED");
		assertThat(response.portfolios()).hasSize(1);
		assertThat(response.portfolios().get(0).portfolioId()).isEqualTo(10L);
		assertThat(response.portfolios().get(0).name()).isEqualTo("nurse_resume.pdf");
		assertThat(response.portfolios().get(0).url()).isEqualTo("https://s3.test/portfolio.pdf");
	}

	@Test
	@DisplayName("returns certificate status as stored")
	void getUserProfileReturnsCertificateStatus() {
		Long userId = 1L;
		User user = User.builder()
			.userId(userId)
			.name("Minjeong Kim")
			.email("minjeong@email.com")
			.birth("2000.05.20")
			.gender(Gender.FEMALE)
			.hasResidenceCard(false)
			.certificateStatus(CertificateStatus.PENDING)
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(resumeRepository.findByUserOrderByResumeIdDesc(user)).thenReturn(List.of());

		UserProfileResponse response = userService.getUserProfile(userId);

		assertThat(response.certificateStatus()).isEqualTo("PENDING");
		assertThat(response.portfolios()).isEmpty();
	}

	@Test
	@DisplayName("throws when user does not exist")
	void getUserProfileThrowsWhenUserNotFound() {
		Long userId = 1L;

		when(userRepository.findById(userId)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> userService.getUserProfile(userId))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(USER_NOT_FOUND);
	}
}
