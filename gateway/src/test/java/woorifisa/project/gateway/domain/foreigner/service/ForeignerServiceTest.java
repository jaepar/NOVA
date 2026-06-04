package woorifisa.project.gateway.domain.foreigner.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.gateway.domain.foreigner.dto.GovernmentIdentityLookupRequest;
import woorifisa.project.gateway.domain.foreigner.dto.GovernmentIdentityResponse;
import woorifisa.project.gateway.domain.foreigner.entity.Foreigner;
import woorifisa.project.gateway.domain.foreigner.repository.ForeignerRepository;
import woorifisa.project.gateway.global.exception.CustomException;

import static woorifisa.project.gateway.global.response.status.BaseExceptionResponseStatus.GOVERNMENT_IDENTITY_NOT_FOUND;

class ForeignerServiceTest {

	private static final String REGISTRATION_NUMBER_HASH =
		"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

	private ForeignerService governmentIdentityService;

	private ForeignerRepository foreignerRepository;

	@BeforeEach
	void setUp() {
		foreignerRepository = org.mockito.Mockito.mock(ForeignerRepository.class);
		governmentIdentityService = new ForeignerService(foreignerRepository);
	}

	@Test
	@DisplayName("식별번호 해시로 신원 정보를 조회한다")
	void lookupIdentitySuccess() {
		Foreigner foreigner = Foreigner.builder()
			.name("박재하")
			.registrationNumberHash(REGISTRATION_NUMBER_HASH)
			.issueDate("2024.11.13")
			.active(true)
			.build();

		when(foreignerRepository.findByRegistrationNumberHash(REGISTRATION_NUMBER_HASH))
			.thenReturn(Optional.of(foreigner));

		GovernmentIdentityResponse response = governmentIdentityService.lookupIdentity(
			new GovernmentIdentityLookupRequest(REGISTRATION_NUMBER_HASH)
		);

		assertThat(response.name()).isEqualTo("박재하");
		assertThat(response.issueDate()).isEqualTo("2024.11.13");
		assertThat(response.active()).isTrue();
		verify(foreignerRepository).findByRegistrationNumberHash(REGISTRATION_NUMBER_HASH);
	}

	@Test
	@DisplayName("신원 정보가 없으면 예외를 던진다")
	void lookupIdentityNotFound() {
		when(foreignerRepository.findByRegistrationNumberHash(REGISTRATION_NUMBER_HASH))
			.thenReturn(Optional.empty());

		assertThatThrownBy(() -> governmentIdentityService.lookupIdentity(
			new GovernmentIdentityLookupRequest(REGISTRATION_NUMBER_HASH)
		)).isInstanceOfSatisfying(CustomException.class,
			exception -> assertThat(exception.getExceptionStatus()).isEqualTo(GOVERNMENT_IDENTITY_NOT_FOUND));
	}
}
