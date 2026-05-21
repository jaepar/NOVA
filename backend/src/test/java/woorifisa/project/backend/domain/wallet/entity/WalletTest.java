package woorifisa.project.backend.domain.wallet.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WalletTest {

    @Test
    void chargeIncreasesBalanceByAmount() {
        Wallet wallet = Wallet.builder()
                .balance(30000)
                .build();

        wallet.charge(10000);

        assertThat(wallet.getBalance()).isEqualTo(40000);
    }
}
