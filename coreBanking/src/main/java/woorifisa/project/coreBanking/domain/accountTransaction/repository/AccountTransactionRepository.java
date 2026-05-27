package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    // 거래 고유 식별자(external_request_id)가 있는지 확인
    boolean existsByExternalRequestId(String externalRequestId);
}
