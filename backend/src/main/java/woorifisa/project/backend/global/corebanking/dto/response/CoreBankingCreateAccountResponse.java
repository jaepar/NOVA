package woorifisa.project.backend.global.corebanking.dto.response;

public record CoreBankingCreateAccountResponse(
        Long accountId,
        Long customerId,
        String accountName,
        String accountNumber,
        Integer transferLimit
) {
}
