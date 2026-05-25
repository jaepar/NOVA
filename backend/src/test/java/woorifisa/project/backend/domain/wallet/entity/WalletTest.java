package woorifisa.project.backend.domain.wallet.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.backend.global.exception.CustomException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_INVALID_CHARGE_AMOUNT;

class WalletTest {

    @Test
    @DisplayName("월렛 잔액을 충전 금액만큼 증가시킨다")
    void success() {
        Wallet wallet = Wallet.builder()
                .balance(30000)
                .build();

        wallet.charge(10000);

        assertThat(wallet.getBalance()).isEqualTo(40000);
    }

    @Test
    @DisplayName("월렛 잔액이 Integer 범위를 넘으면 예외를 던진다")
    void amountOverflow() {
        Wallet wallet = Wallet.builder()
                .balance(Integer.MAX_VALUE)
                .build();

        assertThatThrownBy(() -> wallet.charge(1))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_INVALID_CHARGE_AMOUNT));
    }
}
