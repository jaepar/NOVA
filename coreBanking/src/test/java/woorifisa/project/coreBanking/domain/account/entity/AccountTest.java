package woorifisa.project.coreBanking.domain.account.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AccountTest {

    @Test
    @DisplayName("계좌 잔액을 요청 금액만큼 차감한다")
    void debitDecreasesBalance() {
        Account account = Account.builder()
                .balance(30000)
                .build();

        account.debit(10000);

        assertThat(account.getBalance()).isEqualTo(20000);
    }

    @Test
    @DisplayName("잔액보다 큰 금액은 차감하지 않는다")
    void debitRejectsInsufficientBalance() {
        Account account = Account.builder()
                .balance(30000)
                .build();

        assertThatThrownBy(() -> account.debit(40000))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(account.getBalance()).isEqualTo(30000);
    }

    @Test
    @DisplayName("0원 이하 금액은 차감하지 않는다")
    void debitRejectsNonPositiveAmount() {
        Account account = Account.builder()
                .balance(30000)
                .build();

        assertThatThrownBy(() -> account.debit(0))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(account.getBalance()).isEqualTo(30000);
    }
}
