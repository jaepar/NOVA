package woorifisa.project.coreBanking.domain.wallet.dto.response;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DebitWalletAccountResponseTest {

    @Test
    @DisplayName("월렛 충전 계좌차감 응답 필드를 저장한다")
    void storesResponseFields() {
        DebitWalletAccountResponse response = new DebitWalletAccountResponse(
                true,
                20000,
                "계좌 차감이 완료되었습니다."
        );

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo(20000);
        assertThat(response.message()).isEqualTo("계좌 차감이 완료되었습니다.");
    }
}
