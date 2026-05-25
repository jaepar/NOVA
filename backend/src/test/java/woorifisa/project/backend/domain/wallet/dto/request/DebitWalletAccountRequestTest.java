package woorifisa.project.backend.domain.wallet.dto.request;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DebitWalletAccountRequestTest {

    @Test
    @DisplayName("On-Prem 계좌 차감 요청 필드를 보관한다")
    void success() {
        DebitWalletAccountRequest request = new DebitWalletAccountRequest(
                "WCR-20260514-0001",
                1001L,
                2001L,
                10000
        );

        assertThat(request.walletChargeRequestId()).isEqualTo("WCR-20260514-0001");
        assertThat(request.customerId()).isEqualTo(1001L);
        assertThat(request.withdrawAccountId()).isEqualTo(2001L);
        assertThat(request.chargeAmount()).isEqualTo(10000);
    }
}
