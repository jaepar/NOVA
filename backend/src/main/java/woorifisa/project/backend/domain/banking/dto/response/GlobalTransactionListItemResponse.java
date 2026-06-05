package woorifisa.project.backend.domain.banking.dto.response;

public record GlobalTransactionListItemResponse(
        Long globalTransactionId,
        String receiverEngName,
        String remitAmount,
        String currency,
        String status,
        String createdAt
) {
}
