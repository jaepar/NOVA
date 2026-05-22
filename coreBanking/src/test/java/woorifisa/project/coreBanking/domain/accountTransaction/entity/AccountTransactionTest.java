package woorifisa.project.coreBanking.domain.accountTransaction.entity;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

class AccountTransactionTest {

    @Test
    @DisplayName("외부 요청 식별자를 저장한다")
    void storesExternalRequestId() {
        AccountTransaction transaction = AccountTransaction.builder()
                .externalRequestId("WCR-20260514-0001")
                .build();

        assertThat(transaction.getExternalRequestId()).isEqualTo("WCR-20260514-0001");
    }

    @Test
    @DisplayName("외부 요청 식별자 유니크 제약을 선언한다")
    void externalRequestIdIsUnique() {
        Table table = AccountTransaction.class.getAnnotation(Table.class);

        assertThat(table).isNotNull();
        assertThat(Arrays.stream(table.uniqueConstraints())
                .map(UniqueConstraint::name))
                .contains("uk_account_transaction_external_request_id");
    }
}
