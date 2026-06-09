package woorifisa.project.coreBanking.domain.globalTransaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransaction;

import java.util.List;
import java.util.Optional;

public interface GlobalTransactionRepository extends JpaRepository<GlobalTransaction, Long> {

    Optional<GlobalTransaction> findByExternalRequestId(String externalRequestId);

    List<GlobalTransaction> findAllByCustomer_CustomerIdOrderByCreatedAtDesc(Long customerId);
}
