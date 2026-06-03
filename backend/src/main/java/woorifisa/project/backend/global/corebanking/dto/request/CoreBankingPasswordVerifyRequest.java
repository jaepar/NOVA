package woorifisa.project.backend.global.corebanking.dto.request;

public record CoreBankingPasswordVerifyRequest(
        Long accountId,
        String accountPassword
) {
    public static CoreBankingPasswordVerifyRequest of(Long accountId, String accountPassword) {
        return new CoreBankingPasswordVerifyRequest(accountId, accountPassword);
    }
}
