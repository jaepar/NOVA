package woorifisa.project.backend.domain.wallet.dto.request;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ChargeWalletRequestTest {

    @Test
    @DisplayName("월렛 충전 요청 필드를 보관한다")
    void success() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        assertThat(request.chargeAmount()).isEqualTo(10000);
    }
}
