package woorifisa.project.coreBanking.domain.wallet.dto.response;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DebitWalletAccountResponseTest {

    @Test
    void storesWalletChargeDebitResponseFields() {
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
