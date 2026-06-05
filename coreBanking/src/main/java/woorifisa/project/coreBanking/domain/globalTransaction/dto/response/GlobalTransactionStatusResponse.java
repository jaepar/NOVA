package woorifisa.project.coreBanking.domain.globalTransaction.dto.response;

import woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransaction;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionFailureReason;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;

public record GlobalTransactionStatusResponse(
        Long globalTransactionId,
        GlobalTransactionStatus status,
        GlobalTransactionFailureReason failureReason
) {
    public static GlobalTransactionStatusResponse from(GlobalTransaction globalTransaction) {
        return new GlobalTransactionStatusResponse(
                globalTransaction.getGlobalTransactionId(),
                globalTransaction.getStatus(),
                globalTransaction.getFailureReason()
        );
    }
}
