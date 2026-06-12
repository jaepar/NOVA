package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AccountTransactionRepositoryTest {

    @Test
    @DisplayName("멱등 처리용 externalRequestId 조회 메서드가 존재한다")
    void externalRequestIdLookupExists() throws NoSuchMethodException {
        assertThat(AccountTransactionRepository.class.getMethod("existsByExternalRequestId", String.class))
                .isNotNull();
    }

    @Test
    @DisplayName("거래내역 Slice 조회 메서드가 존재한다")
    void transactionHistoryLookupExists() throws NoSuchMethodException {
        assertThat(AccountTransactionRepository.class.getMethod(
                "findTransactions",
                Long.class,
                TransactionFlow.class,
                String.class,
                LocalDateTime.class,
                LocalDateTime.class,
                Pageable.class
        ).getReturnType()).isEqualTo(Slice.class);
    }

    @Test
    @DisplayName("상한 포함 Between 기반 조회 메서드는 사용하지 않는다")
    void transactionHistoryLookupDoesNotUseInclusiveUpperBound() {
        assertThatThrownBy(() -> AccountTransactionRepository.class.getMethod(
                "findByAccount_AccountIdAndCreatedAtBetween",
                Long.class,
                LocalDateTime.class,
                LocalDateTime.class,
                Pageable.class
        )).isInstanceOf(NoSuchMethodException.class);

        assertThatThrownBy(() -> AccountTransactionRepository.class.getMethod(
                "findByAccount_AccountIdAndTransactionFlowAndCreatedAtBetween",
                Long.class,
                TransactionFlow.class,
                LocalDateTime.class,
                LocalDateTime.class,
                Pageable.class
        )).isInstanceOf(NoSuchMethodException.class);
    }
}
