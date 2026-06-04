package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;

import java.time.LocalDateTime;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    // 거래 고유 식별자(external_request_id)가 있는지 확인
    boolean existsByExternalRequestId(String externalRequestId);

    // 계좌의 기간, 입출금 유형, 검색어 조건에 맞는 거래내역을 페이지 단위로 조회
    // to는 다음날 자정으로 들어오므로 LessThan 조건을 사용해 종료일 다음날 00:00 거래가 포함되지 않게 한다.
    // transactionFlow나 keyword가 null이면 해당 조건은 적용하지 않는다.
    @Query("""
            SELECT transaction
            FROM AccountTransaction transaction
            WHERE transaction.account.accountId = :accountId
              AND transaction.createdAt >= :from
              AND transaction.createdAt < :to
              AND (:transactionFlow IS NULL OR transaction.transactionFlow = :transactionFlow)
              AND (
                    :keyword IS NULL
                    OR LOWER(transaction.counterParty) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(transaction.memo) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  )
            """)
    Slice<AccountTransaction> findTransactions(
            @Param("accountId") Long accountId,
            @Param("transactionFlow") TransactionFlow transactionFlow,
            @Param("keyword") String keyword,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );
}
