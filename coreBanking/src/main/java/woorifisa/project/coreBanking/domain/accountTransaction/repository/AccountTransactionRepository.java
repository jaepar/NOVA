package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;

import java.util.Optional;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    // 거래 고유 식별자(external_request_id)가 있는지 확인
    boolean existsByExternalRequestId(String externalRequestId);

    // 계좌에 속한 거래내역인지 확인하면서 거래내역을 조회한다.
    Optional<AccountTransaction> findByAccount_AccountIdAndAccountTransactionId(
            Long accountId,
            Long accountTransactionId
    );
}
