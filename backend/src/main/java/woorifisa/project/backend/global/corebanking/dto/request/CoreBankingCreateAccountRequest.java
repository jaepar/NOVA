package woorifisa.project.backend.global.corebanking.dto.request;

import woorifisa.project.backend.domain.banking.dto.request.AccountCreateRequest;
import woorifisa.project.backend.domain.user.entity.User;

public record CoreBankingCreateAccountRequest(
        String accountType,
        String accountName,
        CustomerInfo customerInfo,
        String job,
        TransactionInfo transactionInfo,
        Boolean hasForeignTax,
        String accountPassword
) {
    public static CoreBankingCreateAccountRequest of(User user, AccountCreateRequest request) {
        return new CoreBankingCreateAccountRequest(
                request.accountType(),
                request.accountName(),
                new CustomerInfo(
                        user.getName(),
                        user.getEmail(),
                        request.customerInfo().address(),
                        request.customerInfo().addressDetail()
                ),
                request.job(),
                new TransactionInfo(
                        request.transactionInfo().purpose(),
                        request.transactionInfo().source()
                ),
                request.hasForeignTax(),
                request.accountPassword()
        );
    }

    public record CustomerInfo(
            String name,
            String email,
            String address,
            String addressDetail
    ) {
    }

    public record TransactionInfo(
            String purpose,
            String source
    ) {
    }
}
