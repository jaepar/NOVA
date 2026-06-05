package woorifisa.project.coreBanking.domain.globalTransaction.fds.dto;

import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionFailureReason;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;

public record FdsGlobalTransactionScreeningResponse(
        Long globalTransactionId,
        GlobalTransactionStatus status,
        GlobalTransactionFailureReason failureReason,
        Double anomalyScore,
        Double threshold
) {
}
