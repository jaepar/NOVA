package woorifisa.project.backend.domain.banking.dto.response;

import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingGlobalTransactionListItemResponse;

public record GlobalTransactionListItemResponse(
        Long globalTransactionId,
        String targetCountry,
        String receiverEngName,
        String remitAmount,
        String currency,
        String status,
        String createdAt
) {
    public static GlobalTransactionListItemResponse from(CoreBankingGlobalTransactionListItemResponse response) {
        return new GlobalTransactionListItemResponse(
                response.globalTransactionId(),
                response.targetCountry(),
                response.receiverEngName(),
                response.remitAmount(),
                response.currency(),
                response.status(),
                response.createdAt()
        );
    }
}
