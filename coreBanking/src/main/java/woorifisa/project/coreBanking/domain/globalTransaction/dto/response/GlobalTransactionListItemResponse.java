package woorifisa.project.coreBanking.domain.globalTransaction.dto.response;

import woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransaction;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;

public record GlobalTransactionListItemResponse(
        Long globalTransactionId,
        String targetCountry,
        String receiverEngName,
        String remitAmount,
        String currency,
        GlobalTransactionStatus status,
        String createdAt
) {
    public static GlobalTransactionListItemResponse from(GlobalTransaction globalTransaction) {
        return new GlobalTransactionListItemResponse(
                globalTransaction.getGlobalTransactionId(),
                globalTransaction.getTargetCountry(),
                globalTransaction.getReceiverEngName(),
                globalTransaction.getRemitAmount(),
                globalTransaction.getCurrency().name(),
                globalTransaction.getStatus(),
                globalTransaction.getCreatedAt() == null ? null : globalTransaction.getCreatedAt().toString()
        );
    }
}
