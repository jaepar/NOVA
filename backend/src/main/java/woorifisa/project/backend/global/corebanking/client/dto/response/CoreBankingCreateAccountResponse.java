package woorifisa.project.backend.global.corebanking.client.dto.response;

public record CoreBankingCreateAccountResponse(
        Long accountId,
        Long customerId,
        String accountName,
        String accountNumber
) {
}
