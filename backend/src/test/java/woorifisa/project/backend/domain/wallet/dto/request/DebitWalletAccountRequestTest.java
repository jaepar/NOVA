package woorifisa.project.backend.domain.wallet.dto.request;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DebitWalletAccountRequestTest {

    @Test
    void storesOnPremDebitRequestFields() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                10000L
        );

        assertThat(request.walletChargeRequestId()).isEqualTo("WCR-20260514-0001");
        assertThat(request.customerId()).isEqualTo(1001L);
        assertThat(request.withdrawAccountId()).isEqualTo(2001L);
        assertThat(request.chargeAmount()).isEqualTo(10000L);
    }
}
