package woorifisa.project.gateway.domain.foreigner.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import woorifisa.project.gateway.domain.foreigner.entity.Foreigner;
import woorifisa.project.gateway.domain.foreigner.repository.ForeignerRepository;
import woorifisa.project.gateway.global.config.ForeignerDataInitializer;
import woorifisa.project.gateway.global.security.RegistrationNumberHmacHasher;

class ForeignerDataInitializerTest {

	private static final String SECRET = "test-secret";

	@Test
	@DisplayName("초기 더미데이터는 식별번호 원문이 아닌 HMAC 해시로 저장한다")
	void seedForeignerWithRegistrationNumberHash() {
		ForeignerRepository foreignerRepository = org.mockito.Mockito.mock(ForeignerRepository.class);
		RegistrationNumberHmacHasher hasher = new RegistrationNumberHmacHasher(SECRET);
		String expectedHash = hasher.hash("010205-3398413");

		when(foreignerRepository.findByRegistrationNumberHash(expectedHash)).thenReturn(Optional.empty());

		ForeignerDataInitializer initializer = new ForeignerDataInitializer(foreignerRepository, hasher);
		initializer.run();

		ArgumentCaptor<Foreigner> captor = ArgumentCaptor.forClass(Foreigner.class);
		verify(foreignerRepository).save(captor.capture());

		Foreigner savedForeigner = captor.getValue();
		assertThat(savedForeigner.getName()).isEqualTo("박재하");
		assertThat(savedForeigner.getRegistrationNumberHash()).isEqualTo(expectedHash);
		assertThat(savedForeigner.getRegistrationNumberHash()).hasSize(64);
		assertThat(savedForeigner.getIssueDate()).isEqualTo("2024.11.13");
		assertThat(savedForeigner.getActive()).isTrue();
	}

	@Test
	@DisplayName("같은 식별번호 해시가 이미 있으면 초기 더미데이터를 중복 저장하지 않는다")
	void skipDuplicateForeignerSeed() {
		ForeignerRepository foreignerRepository = org.mockito.Mockito.mock(ForeignerRepository.class);
		RegistrationNumberHmacHasher hasher = new RegistrationNumberHmacHasher(SECRET);
		String expectedHash = hasher.hash("010205-3398413");

		when(foreignerRepository.findByRegistrationNumberHash(expectedHash))
			.thenReturn(Optional.of(Foreigner.builder()
				.name("박재하")
				.registrationNumberHash(expectedHash)
				.issueDate("2024.11.13")
				.active(true)
				.build()));

		ForeignerDataInitializer initializer = new ForeignerDataInitializer(foreignerRepository, hasher);
		initializer.run();

		verify(foreignerRepository, never()).save(any());
	}
}
