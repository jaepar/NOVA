package woorifisa.project.backend.domain.banking.dto.corebanking.response;

public record CoreBankingCreateGlobalTransactionResponse(
        Long globalTransactionId,
        String status
) {
}
