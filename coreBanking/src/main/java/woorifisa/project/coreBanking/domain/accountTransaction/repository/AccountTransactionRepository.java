package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;

import java.time.LocalDateTime;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    // 거래 고유 식별자(external_request_id)가 있는지 확인
    boolean existsByExternalRequestId(String externalRequestId);

    // 계좌의 기간 내 전체 거래내역 페이징 조회
    Slice<AccountTransaction> findByAccount_AccountIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            Long accountId,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    );

    // 계좌의 기간 내 입출금 유형별 거래내역 페이징 조회
    Slice<AccountTransaction> findByAccount_AccountIdAndTransactionFlowAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            Long accountId,
            TransactionFlow transactionFlow,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    );
}
