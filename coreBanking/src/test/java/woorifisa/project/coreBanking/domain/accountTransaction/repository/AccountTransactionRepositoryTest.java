package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AccountTransactionRepositoryTest {

    @Test
    @DisplayName("멱등 처리를 위한 외부 요청 식별자 조회 메서드를 제공한다")
    void externalRequestIdLookupExists() throws NoSuchMethodException {
        assertThat(AccountTransactionRepository.class.getMethod("existsByExternalRequestId", String.class))
                .isNotNull();
    }
}
