package woorifisa.project.backend.domain.wallet.dto.request;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ChargeWalletRequestTest {

    @Test
    void storesWithdrawAccountIdAndChargeAmount() {
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 10000L);

        assertThat(request.withdrawAccountId()).isEqualTo(2001L);
        assertThat(request.chargeAmount()).isEqualTo(10000L);
    }
}
