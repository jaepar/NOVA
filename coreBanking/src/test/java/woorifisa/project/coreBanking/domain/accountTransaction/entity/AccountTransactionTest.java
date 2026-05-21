package woorifisa.project.coreBanking.domain.accountTransaction.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AccountTransactionTest {

    @Test
    void storesExternalRequestIdForIdempotentExternalDebitRequests() {
        AccountTransaction transaction = AccountTransaction.builder()
                .externalRequestId("WCR-20260514-0001")
                .build();

        assertThat(transaction.getExternalRequestId()).isEqualTo("WCR-20260514-0001");
    }
}
