package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    boolean existsByExternalRequestId(String externalRequestId);
}
