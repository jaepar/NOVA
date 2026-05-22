package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;

import java.util.Optional;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    Optional<AccountTransaction> findByExternalRequestId(String externalRequestId);
}
