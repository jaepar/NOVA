package woorifisa.project.backend.domain.banking.dto.corebanking.request;

public record CoreBankingRecipientLookupRequest(
        String bankCode,
        String accountNumber
) {
    public static CoreBankingRecipientLookupRequest of(String bankCode, String accountNumber) {
        return new CoreBankingRecipientLookupRequest(bankCode, accountNumber);
    }
}
