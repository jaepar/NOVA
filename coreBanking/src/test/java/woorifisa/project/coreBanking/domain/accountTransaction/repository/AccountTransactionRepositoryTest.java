package woorifisa.project.coreBanking.domain.accountTransaction.repository;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AccountTransactionRepositoryTest {

    @Test
    void exposesExternalRequestIdLookupForIdempotentWalletDebit() throws NoSuchMethodException {
        assertThat(AccountTransactionRepository.class.getMethod("existsByExternalRequestId", String.class))
                .isNotNull();
    }
}
