package woorifisa.project.coreBanking.domain.account.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AccountTest {

    @Test
    void debitDecreasesBalanceByAmount() {
        Account account = Account.builder()
                .balance(30000)
                .build();

        account.debit(10000);

        assertThat(account.getBalance()).isEqualTo(20000);
    }

    @Test
    void debitRejectsAmountGreaterThanBalanceWithoutChangingBalance() {
        Account account = Account.builder()
                .balance(30000)
                .build();

        assertThatThrownBy(() -> account.debit(40000))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(account.getBalance()).isEqualTo(30000);
    }

    @Test
    void debitRejectsNonPositiveAmountWithoutChangingBalance() {
        Account account = Account.builder()
                .balance(30000)
                .build();

        assertThatThrownBy(() -> account.debit(0))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(account.getBalance()).isEqualTo(30000);
    }
}
