package woorifisa.project.backend.global.corebanking.dto.response;

public record CoreBankingGlobalTransactionListItemResponse(
        Long globalTransactionId,
        String targetCountry,
        String receiverEngName,
        String remitAmount,
        String currency,
        String status,
        String createdAt
) {
}
