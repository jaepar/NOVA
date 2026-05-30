package woorifisa.project.coreBanking.domain.customer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import woorifisa.project.coreBanking.domain.customer.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
	Optional<Customer> findByNameAndEmail(String name, String email);
	boolean existsByBackendUserId(Long backendUserId);
}
