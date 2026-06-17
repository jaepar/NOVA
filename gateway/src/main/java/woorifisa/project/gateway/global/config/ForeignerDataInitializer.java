package woorifisa.project.gateway.global.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import woorifisa.project.gateway.domain.foreigner.entity.Foreigner;
import woorifisa.project.gateway.domain.foreigner.repository.ForeignerRepository;
import woorifisa.project.gateway.global.security.RegistrationNumberHmacHasher;

@Component
@Profile({"local", "dev"})
@RequiredArgsConstructor
public class ForeignerDataInitializer implements CommandLineRunner {

	private final ForeignerRepository foreignerRepository;
	private final RegistrationNumberHmacHasher registrationNumberHmacHasher;

	@Override
	@Transactional
	public void run(String... args) {
		// foreigner 초기 더미데이터 생성 (이름, 주민등록번호, 발급일자, active 여부)
		seedForeigner("박재하", "010205-3398413", "2024.11.13", true);
	}

	private void seedForeigner(String name, String registrationNumber, String issueDate, boolean active) {
		String registrationNumberHash = registrationNumberHmacHasher.hash(registrationNumber);

		if (foreignerRepository.findByRegistrationNumberHash(registrationNumberHash).isPresent()) {
			return;
		}

		foreignerRepository.save(Foreigner.builder()
			.name(name)
			.registrationNumberHash(registrationNumberHash)
			.issueDate(issueDate)
			.active(active)
			.build());
	}
}
