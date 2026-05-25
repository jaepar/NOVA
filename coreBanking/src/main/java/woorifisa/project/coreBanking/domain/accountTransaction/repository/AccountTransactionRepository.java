package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;

import java.util.Optional;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    // 외부 요청 ID로 이체 처리 결과를 조회
    Optional<AccountTransaction> findByExternalRequestId(String externalRequestId);

    boolean existsByExternalRequestId(String externalRequestId);
}
