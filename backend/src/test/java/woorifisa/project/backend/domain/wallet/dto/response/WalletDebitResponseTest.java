package woorifisa.project.backend.domain.wallet.dto.response;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WalletDebitResponseTest {

    @Test
    @DisplayName("CoreBanking 계좌 차감 응답 필드를 보관한다")
    void success() {
        WalletDebitResponse response = new WalletDebitResponse(
                true,
                "20000",
                "OK"
        );

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo("20000");
        assertThat(response.message()).isEqualTo("OK");
    }
}
