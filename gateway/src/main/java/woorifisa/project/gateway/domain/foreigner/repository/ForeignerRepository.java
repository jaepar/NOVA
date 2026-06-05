package woorifisa.project.gateway.domain.foreigner.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.gateway.domain.foreigner.entity.Foreigner;

public interface ForeignerRepository extends JpaRepository<Foreigner, Long> {

	Optional<Foreigner> findByRegistrationNumberHash(String registrationNumberHash);
}
