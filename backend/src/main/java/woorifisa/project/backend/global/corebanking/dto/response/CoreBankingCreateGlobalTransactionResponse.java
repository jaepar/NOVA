package woorifisa.project.backend.global.corebanking.dto.response;

public record CoreBankingCreateGlobalTransactionResponse(
        Long globalTransactionId,
        String status
) {
}
