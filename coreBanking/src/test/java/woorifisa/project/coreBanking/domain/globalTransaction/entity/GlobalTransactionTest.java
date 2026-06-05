package woorifisa.project.coreBanking.domain.globalTransaction.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionFailureReason;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalTransactionTest {

    @Test
    @DisplayName("해외송금 원장은 FDS 심사 대기 상태로 생성된다")
    void createPending() {
        GlobalTransaction transaction = GlobalTransaction.builder()
                .externalRequestId("global-remittance-1")
                .status(GlobalTransactionStatus.PENDING)
                .build();

        assertThat(transaction.getStatus()).isEqualTo(GlobalTransactionStatus.PENDING);
        assertThat(transaction.getFailureReason()).isNull();
        assertThat(transaction.getExternalRequestId()).isEqualTo("global-remittance-1");
    }

    @Test
    @DisplayName("FDS 성공이면 상태는 SUCCESS이고 실패 사유는 없다")
    void markSuccess() {
        GlobalTransaction transaction = GlobalTransaction.builder()
                .externalRequestId("global-remittance-1")
                .status(GlobalTransactionStatus.PENDING)
                .build();

        transaction.markSuccess();

        assertThat(transaction.getStatus()).isEqualTo(GlobalTransactionStatus.SUCCESS);
        assertThat(transaction.getFailureReason()).isNull();
    }

    @Test
    @DisplayName("FDS 실패이면 상태는 FAILED이고 실패 사유를 남긴다")
    void markFailed() {
        GlobalTransaction transaction = GlobalTransaction.builder()
                .externalRequestId("global-remittance-1")
                .status(GlobalTransactionStatus.PENDING)
                .build();

        transaction.markFailed(GlobalTransactionFailureReason.FDS_RISK_DETECTED);

        assertThat(transaction.getStatus()).isEqualTo(GlobalTransactionStatus.FAILED);
        assertThat(transaction.getFailureReason()).isEqualTo(GlobalTransactionFailureReason.FDS_RISK_DETECTED);
    }
}
