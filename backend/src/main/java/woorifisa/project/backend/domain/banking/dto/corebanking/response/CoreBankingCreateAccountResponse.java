package woorifisa.project.backend.domain.banking.dto.corebanking.response;

public record CoreBankingCreateAccountResponse(
        Long accountId,
        Long customerId,
        String accountName,
        String accountNumber
) {
}
