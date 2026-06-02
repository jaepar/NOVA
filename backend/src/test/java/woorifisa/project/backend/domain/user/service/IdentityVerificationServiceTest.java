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
import woorifisa.project.backend.domain.user.dto.response.ocr.IdCardOcrResponse;
import woorifisa.project.backend.domain.user.dto.response.IdentityVerificationResponse;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.Gender;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.domain.user.service.ocr.IdCardOcrService;
import woorifisa.project.backend.domain.user.service.ocr.PassportOcrService;
import woorifisa.project.backend.global.government.client.GovernmentIdentityClient;
import woorifisa.project.backend.global.government.client.response.GovermentIdentityResponse;
import woorifisa.project.backend.global.security.RegistrationNumberHmacHasher;

class IdentityVerificationServiceTest {

	@Test
	@DisplayName("ID_CARD OCR 값이 user와 정부DB 정보에 일치하면 인증 성공을 반환한다")
	void verifyIdentitySuccess() {
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
			.hasCertificate(false)
			.hasDelete(false)
			.build();

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(idCardOcrService.recognizeIdCard(org.mockito.ArgumentMatchers.any()))
			.thenReturn(new IdCardOcrResponse("홍길동", "900101-1234567", "2020.01.01"));
		when(governmentIdentityClient.lookupByRegistrationNumberHash(
			new RegistrationNumberHmacHasher("test-secret").hash("900101-1234567"))
		).thenReturn(new GovermentIdentityResponse("홍길동", "2020-01-01", true));

		MockMultipartFile file = new MockMultipartFile("file", "id.jpg", "image/jpeg", "img".getBytes());
		IdentityVerificationResponse response = service.verifyIdentity(1L, file, OcrDocumentType.ID_CARD);

		assertThat(response.verificationStatus()).isEqualTo("VERIFIED");
		assertThat(response.nameMatchWithUser()).isTrue();
		assertThat(response.identityMatchWithGovDb()).isTrue();
		assertThat(response.failureReasonCode()).isNull();
		assertThat(user.getHasResidenceCard()).isTrue();
		verify(notificationService).deleteResidenceCardPeriodNotification(user);
	}

	@Test
	@DisplayName("OCR 이름이 user.name과 다르면 즉시 FAILED를 반환한다")
	void verifyIdentityNameMismatch() {
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
			.hasCertificate(false)
			.hasDelete(false)
			.build();

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(idCardOcrService.recognizeIdCard(org.mockito.ArgumentMatchers.any()))
			.thenReturn(new IdCardOcrResponse("김철수", "900101-1234567", "2020.01.01"));

		MockMultipartFile file = new MockMultipartFile("file", "id.jpg", "image/jpeg", "img".getBytes());
		IdentityVerificationResponse response = service.verifyIdentity(1L, file, OcrDocumentType.ID_CARD);

		assertThat(response.verificationStatus()).isEqualTo("FAILED");
		assertThat(response.failureReasonCode()).isEqualTo("IDENTITY_NAME_MISMATCH_WITH_USER");
		assertThat(response.nameMatchWithUser()).isFalse();
		verify(governmentIdentityClient, never()).lookupByRegistrationNumberHash(org.mockito.ArgumentMatchers.any());
		verify(notificationService, never()).deleteResidenceCardPeriodNotification(org.mockito.ArgumentMatchers.any());
	}

	@Test
	@DisplayName("정부DB 정보와 불일치하면 실패를 반환한다")
	void verifyIdentityGovernmentMismatch() {
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
			.hasCertificate(false)
			.hasDelete(false)
			.build();

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(idCardOcrService.recognizeIdCard(org.mockito.ArgumentMatchers.any()))
			.thenReturn(new IdCardOcrResponse("홍길동", "900101-1234567", "2020.01.01"));
		when(governmentIdentityClient.lookupByRegistrationNumberHash(
			new RegistrationNumberHmacHasher("test-secret").hash("900101-1234567"))
		).thenReturn(new GovermentIdentityResponse("홍길동", "2021-01-01", true));

		MockMultipartFile file = new MockMultipartFile("file", "id.jpg", "image/jpeg", "img".getBytes());
		IdentityVerificationResponse response = service.verifyIdentity(1L, file, OcrDocumentType.ID_CARD);

		assertThat(response.verificationStatus()).isEqualTo("FAILED");
		assertThat(response.nameMatchWithUser()).isTrue();
		assertThat(response.identityMatchWithGovDb()).isFalse();
		assertThat(response.failureReasonCode()).isEqualTo("GOVERNMENT_IDENTITY_MISMATCH");
		assertThat(user.getHasResidenceCard()).isFalse();
		verify(notificationService, never()).deleteResidenceCardPeriodNotification(org.mockito.ArgumentMatchers.any());
	}
}
