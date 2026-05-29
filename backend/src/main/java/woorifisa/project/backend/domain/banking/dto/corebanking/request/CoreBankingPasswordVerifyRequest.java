package woorifisa.project.backend.domain.banking.dto.corebanking.request;

public record CoreBankingPasswordVerifyRequest(
        Long accountId,
        String accountPassword
) {
    public static CoreBankingPasswordVerifyRequest of(Long accountId, String accountPassword) {
        return new CoreBankingPasswordVerifyRequest(accountId, accountPassword);
    }
}
