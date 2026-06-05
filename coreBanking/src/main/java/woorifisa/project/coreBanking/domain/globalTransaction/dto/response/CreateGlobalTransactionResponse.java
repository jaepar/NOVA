package woorifisa.project.coreBanking.domain.globalTransaction.dto.response;

import woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransaction;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;

public record CreateGlobalTransactionResponse(
        Long globalTransactionId,
        GlobalTransactionStatus status
) {
    public static CreateGlobalTransactionResponse from(GlobalTransaction globalTransaction) {
        return new CreateGlobalTransactionResponse(
                globalTransaction.getGlobalTransactionId(),
                globalTransaction.getStatus()
        );
    }
}
