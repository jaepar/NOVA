package woorifisa.project.backend.domain.banking.dto.response;

import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;

public record AccountHomeResponse(
        Long accountId,
        String accountName,
        String accountNumber,
        String bankName,
        Integer balance,
        Boolean hasLimit,
        CertificateStatus certificateStatus
) {
    public static AccountHomeResponse from(AccountRef accountRef) {
        return new AccountHomeResponse(
                accountRef.getAccountId(),
                accountRef.getAccountName(),
                accountRef.getAccountNumber(),
                AccountRef.BANK_NAME,
                accountRef.getBalance(),
                accountRef.getHasLimit(),
                accountRef.getUser().getCertificateStatus()
        );
    }
}
