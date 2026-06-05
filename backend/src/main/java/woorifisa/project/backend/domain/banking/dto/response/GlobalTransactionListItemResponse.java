package woorifisa.project.backend.domain.banking.dto.response;

import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingGlobalTransactionListItemResponse;

public record GlobalTransactionListItemResponse(
        Long globalTransactionId,
        String receiverEngName,
        String remitAmount,
        String currency,
        String status,
        String createdAt
) {
    public static GlobalTransactionListItemResponse from(CoreBankingGlobalTransactionListItemResponse response) {
        return new GlobalTransactionListItemResponse(
                response.globalTransactionId(),
                response.receiverEngName(),
                response.remitAmount(),
                response.currency(),
                response.status(),
                response.createdAt()
        );
    }
}
