package woorifisa.project.backend.domain.banking.dto.response;

public record AccountCreateResponse(
        Long accountId,
        String bankCode,
        String accountNumber
) {
    public static AccountCreateResponse of(Long accountId, String bankCode, String accountNumber) {
        return new AccountCreateResponse(accountId, bankCode, accountNumber);
    }
}
