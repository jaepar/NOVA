package woorifisa.project.backend.domain.user.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	boolean existsByEmail(String email);

	Optional<User> findByEmail(String email);

	List<User> findAllByCertificateStatusAndHasResidenceCardFalseAndIssuedTimeIsNotNull(
		CertificateStatus certificateStatus
	);
}
