package woorifisa.project.backend.domain.banking.dto.corebanking.response;

public record CoreBankingGlobalTransactionListItemResponse(
        Long globalTransactionId,
        String receiverEngName,
        String remitAmount,
        String currency,
        String status,
        String createdAt
) {
}
