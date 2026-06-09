package woorifisa.project.backend.domain.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import woorifisa.project.backend.domain.user.dto.request.OcrDocumentType;
import woorifisa.project.backend.domain.user.dto.request.IdentityVerificationConfirmRequest;
import woorifisa.project.backend.domain.user.dto.response.IdentityOcrResponse;
import woorifisa.project.backend.domain.user.dto.response.ocr.IdCardOcrResponse;
import woorifisa.project.backend.domain.user.dto.response.IdentityVerificationResponse;
import woorifisa.project.backend.domain.user.dto.response.ocr.PassportOcrResponse;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.entity.enums.Gender;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.domain.user.service.ocr.IdCardOcrService;
import woorifisa.project.backend.domain.user.service.ocr.PassportOcrService;
import woorifisa.project.backend.global.government.client.GovernmentIdentityClient;
import woorifisa.project.backend.global.government.client.response.GovermentIdentityResponse;
import woorifisa.project.backend.global.security.RegistrationNumberHmacHasher;

class IdentityVerificationServiceTest {

	@Test
	@DisplayName("ID_CARD OCR 요청은 정부DB 검증 없이 추출 결과만 반환한다")
	void verifyIdentityReturnsExtractedOcrOnly() {
		UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
		IdCardOcrService idCardOcrService = org.mockito.Mockito.mock(IdCardOcrService.class);
		GovernmentIdentityClient governmentIdentityClient = org.mockito.Mockito.mock(GovernmentIdentityClient.class);
		NotificationService notificationService = org.mockito.Mockito.mock(NotificationService.class);

		IdentityVerificationService service = new IdentityVerificationService(
			org.mockito.Mockito.mock(PassportOcrService.class),
			idCardOcrService,
			userRepository,
			governmentIdentityClient,
			new RegistrationNumberHmacHasher("test-secret"),
			notificationService
		);

		when(idCardOcrService.recognizeIdCard(org.mockito.ArgumentMatchers.any()))
			.thenReturn(new IdCardOcrResponse("홍길동", "900101-1234567", "2020.01.01"));

		MockMultipartFile file = new MockMultipartFile("file", "id.jpg", "image/jpeg", "img".getBytes());
		IdentityOcrResponse response = service.verifyIdentity(1L, file, OcrDocumentType.ID_CARD);

		assertThat(response.ocrDocumentType()).isEqualTo(OcrDocumentType.ID_CARD);
		assertThat(response.result()).isEqualTo(new IdCardOcrResponse("홍길동", "900101-1234567", "2020.01.01"));
		assertThat(response.nameMatchWithUser()).isNull();
		verify(userRepository, never()).findById(org.mockito.ArgumentMatchers.any());
		verify(governmentIdentityClient, never()).lookupByRegistrationNumberHash(org.mockito.ArgumentMatchers.any());
		verify(notificationService, never()).deleteResidenceCardPeriodNotification(org.mockito.ArgumentMatchers.any());
	}

	@Test
	@DisplayName("PASSPORT OCR 요청은 추출 결과와 user.name 일치 여부를 반환한다")
	void verifyPassportReturnsExtractedOcrWithNameMatch() {
		UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
		PassportOcrService passportOcrService = org.mockito.Mockito.mock(PassportOcrService.class);
		GovernmentIdentityClient governmentIdentityClient = org.mockito.Mockito.mock(GovernmentIdentityClient.class);
		NotificationService notificationService = org.mockito.Mockito.mock(NotificationService.class);

		IdentityVerificationService service = new IdentityVerificationService(
			passportOcrService,
			org.mockito.Mockito.mock(IdCardOcrService.class),
			userRepository,
			governmentIdentityClient,
			new RegistrationNumberHmacHasher("test-secret"),
			notificationService
		);

		User user = User.builder()
			.userId(1L)
			.name("박재하")
			.birth("2001-02-05")
			.gender(Gender.MALE)
			.email("test@test.com")
			.password("pw")
			.hasResidenceCard(false)
			.certificateStatus(CertificateStatus.NOT_ISSUED)
			.hasDelete(false)
			.build();

		PassportOcrResponse passport = PassportOcrResponse.builder()
			.fullNameKor("박재하")
			.num("M12345678")
			.build();

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(passportOcrService.recognizePassport(org.mockito.ArgumentMatchers.any())).thenReturn(passport);

		MockMultipartFile file = new MockMultipartFile("file", "passport.jpg", "image/jpeg", "img".getBytes());
		IdentityOcrResponse response = service.verifyIdentity(1L, file, OcrDocumentType.PASSPORT);

		assertThat(response.ocrDocumentType()).isEqualTo(OcrDocumentType.PASSPORT);
		assertThat(response.result()).isEqualTo(passport);
		assertThat(response.nameMatchWithUser()).isTrue();
		verify(governmentIdentityClient, never()).lookupByRegistrationNumberHash(org.mockito.ArgumentMatchers.any());
	}

	@Test
	@DisplayName("PASSPORT OCR 이름이 user.name과 다르면 nameMatchWithUser=false를 반환한다")
	void verifyPassportReturnsNameMismatch() {
		UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
		PassportOcrService passportOcrService = org.mockito.Mockito.mock(PassportOcrService.class);
		GovernmentIdentityClient governmentIdentityClient = org.mockito.Mockito.mock(GovernmentIdentityClient.class);
		NotificationService notificationService = org.mockito.Mockito.mock(NotificationService.class);

		IdentityVerificationService service = new IdentityVerificationService(
			passportOcrService,
			org.mockito.Mockito.mock(IdCardOcrService.class),
			userRepository,
			governmentIdentityClient,
			new RegistrationNumberHmacHasher("test-secret"),
			notificationService
		);

		User user = User.builder()
			.userId(1L)
			.name("박재하")
			.birth("2001-02-05")
			.gender(Gender.MALE)
			.email("test@test.com")
			.password("pw")
			.hasResidenceCard(false)
			.certificateStatus(CertificateStatus.NOT_ISSUED)
			.hasDelete(false)
			.build();

		PassportOcrResponse passport = PassportOcrResponse.builder()
			.fullNameKor("홍길동")
			.num("M12345678")
			.build();

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(passportOcrService.recognizePassport(org.mockito.ArgumentMatchers.any())).thenReturn(passport);

		MockMultipartFile file = new MockMultipartFile("file", "passport.jpg", "image/jpeg", "img".getBytes());
		IdentityOcrResponse response = service.verifyIdentity(1L, file, OcrDocumentType.PASSPORT);

		assertThat(response.ocrDocumentType()).isEqualTo(OcrDocumentType.PASSPORT);
		assertThat(response.result()).isEqualTo(passport);
		assertThat(response.nameMatchWithUser()).isFalse();
		verify(governmentIdentityClient, never()).lookupByRegistrationNumberHash(org.mockito.ArgumentMatchers.any());
	}

	@Test
	@DisplayName("확정 요청 값이 user와 정부DB 정보에 일치하면 인증 성공을 반환한다")
	void confirmIdentitySuccess() {
		UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
		IdCardOcrService idCardOcrService = org.mockito.Mockito.mock(IdCardOcrService.class);
		GovernmentIdentityClient governmentIdentityClient = org.mockito.Mockito.mock(GovernmentIdentityClient.class);
		NotificationService notificationService = org.mockito.Mockito.mock(NotificationService.class);

		IdentityVerificationService service = new IdentityVerificationService(
			org.mockito.Mockito.mock(PassportOcrService.class),
			idCardOcrService,
			userRepository,
			governmentIdentityClient,
			new RegistrationNumberHmacHasher("test-secret"),
			notificationService
		);

		User user = User.builder()
			.userId(1L)
			.name("홍길동")
			.birth("1990-01-01")
			.gender(Gender.MALE)
			.email("test@test.com")
			.password("pw")
			.hasResidenceCard(false)
			.certificateStatus(CertificateStatus.NOT_ISSUED)
			.hasDelete(false)
			.build();

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(governmentIdentityClient.lookupByRegistrationNumberHash(
			new RegistrationNumberHmacHasher("test-secret").hash("9001011234567"))
		).thenReturn(new GovermentIdentityResponse("홍길동", "2020-01-01", true));

		IdentityVerificationResponse response = service.confirmIdentity(
			1L,
			new IdentityVerificationConfirmRequest(
				OcrDocumentType.ID_CARD,
				"홍길동",
				"900101-1234567",
				"2020.01.01"
			)
		);

		assertThat(response.verificationStatus()).isEqualTo("VERIFIED");
		assertThat(response.nameMatchWithUser()).isTrue();
		assertThat(response.identityMatchWithGovDb()).isTrue();
		assertThat(response.failureReasonCode()).isNull();
		assertThat(user.getHasResidenceCard()).isTrue();
		verify(idCardOcrService, never()).recognizeIdCard(org.mockito.ArgumentMatchers.any());
		verify(notificationService).deleteResidenceCardPeriodNotification(user);
	}

	@Test
	@DisplayName("확정 요청 이름이 user.name과 다르면 FAILED를 반환한다")
	void confirmIdentityNameMismatch() {
		UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
		IdCardOcrService idCardOcrService = org.mockito.Mockito.mock(IdCardOcrService.class);
		GovernmentIdentityClient governmentIdentityClient = org.mockito.Mockito.mock(GovernmentIdentityClient.class);
		NotificationService notificationService = org.mockito.Mockito.mock(NotificationService.class);

		IdentityVerificationService service = new IdentityVerificationService(
			org.mockito.Mockito.mock(PassportOcrService.class),
			idCardOcrService,
			userRepository,
			governmentIdentityClient,
			new RegistrationNumberHmacHasher("test-secret"),
			notificationService
		);

		User user = User.builder()
			.userId(1L)
			.name("홍길동")
			.birth("1990-01-01")
			.gender(Gender.MALE)
			.email("test@test.com")
			.password("pw")
			.hasResidenceCard(false)
			.certificateStatus(CertificateStatus.NOT_ISSUED)
			.hasDelete(false)
			.build();

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));

		IdentityVerificationResponse response = service.confirmIdentity(
			1L,
			new IdentityVerificationConfirmRequest(
				OcrDocumentType.ID_CARD,
				"김철수",
				"900101-1234567",
				"2020.01.01"
			)
		);

		assertThat(response.verificationStatus()).isEqualTo("FAILED");
		assertThat(response.failureReasonCode()).isEqualTo("IDENTITY_NAME_MISMATCH_WITH_USER");
		assertThat(response.nameMatchWithUser()).isFalse();
		verify(idCardOcrService, never()).recognizeIdCard(org.mockito.ArgumentMatchers.any());
		verify(governmentIdentityClient, never()).lookupByRegistrationNumberHash(org.mockito.ArgumentMatchers.any());
		verify(notificationService, never()).deleteResidenceCardPeriodNotification(org.mockito.ArgumentMatchers.any());
	}

	@Test
	@DisplayName("정부DB 정보와 불일치하면 실패를 반환한다")
	void confirmIdentityGovernmentMismatch() {
		UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
		IdCardOcrService idCardOcrService = org.mockito.Mockito.mock(IdCardOcrService.class);
		GovernmentIdentityClient governmentIdentityClient = org.mockito.Mockito.mock(GovernmentIdentityClient.class);
		NotificationService notificationService = org.mockito.Mockito.mock(NotificationService.class);

		IdentityVerificationService service = new IdentityVerificationService(
			org.mockito.Mockito.mock(PassportOcrService.class),
			idCardOcrService,
			userRepository,
			governmentIdentityClient,
			new RegistrationNumberHmacHasher("test-secret"),
			notificationService
		);

		User user = User.builder()
			.userId(1L)
			.name("홍길동")
			.birth("1990-01-01")
			.gender(Gender.MALE)
			.email("test@test.com")
			.password("pw")
			.hasResidenceCard(false)
			.certificateStatus(CertificateStatus.NOT_ISSUED)
			.hasDelete(false)
			.build();

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(governmentIdentityClient.lookupByRegistrationNumberHash(
			new RegistrationNumberHmacHasher("test-secret").hash("9001011234567"))
		).thenReturn(new GovermentIdentityResponse("홍길동", "2021-01-01", true));

		IdentityVerificationResponse response = service.confirmIdentity(
			1L,
			new IdentityVerificationConfirmRequest(
				OcrDocumentType.ID_CARD,
				"홍길동",
				"900101-1234567",
				"2020.01.01"
			)
		);

		assertThat(response.verificationStatus()).isEqualTo("FAILED");
		assertThat(response.nameMatchWithUser()).isTrue();
		assertThat(response.identityMatchWithGovDb()).isFalse();
		assertThat(response.failureReasonCode()).isEqualTo("GOVERNMENT_IDENTITY_MISMATCH");
		assertThat(user.getHasResidenceCard()).isFalse();
		verify(idCardOcrService, never()).recognizeIdCard(org.mockito.ArgumentMatchers.any());
		verify(notificationService, never()).deleteResidenceCardPeriodNotification(org.mockito.ArgumentMatchers.any());
	}
}
