package woorifisa.project.backend.domain.wallet.entity;

import org.junit.jupiter.api.Test;
import woorifisa.project.backend.global.exception.CustomException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_INVALID_CHARGE_AMOUNT;

class WalletTest {

    @Test
    void chargeIncreasesBalanceByAmount() {
        Wallet wallet = Wallet.builder()
                .balance(30000)
                .build();

        wallet.charge(10000);

        assertThat(wallet.getBalance()).isEqualTo(40000);
    }

    @Test
    void chargeRejectsOverflowedBalance() {
        Wallet wallet = Wallet.builder()
                .balance(Integer.MAX_VALUE)
                .build();

        assertThatThrownBy(() -> wallet.charge(1))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_INVALID_CHARGE_AMOUNT));
    }
}
