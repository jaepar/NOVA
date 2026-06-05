package woorifisa.project.backend.domain.banking.dto.response;

public record CreateGlobalTransactionResponse(
        Long globalTransactionId,
        String status
) {
}
