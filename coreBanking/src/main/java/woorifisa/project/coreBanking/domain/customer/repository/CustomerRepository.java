package woorifisa.project.coreBanking.domain.customer.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import woorifisa.project.coreBanking.domain.customer.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
