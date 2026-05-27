package woorifisa.project.coreBanking.domain.accountTransaction.dto.response;

import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;

public record AccountTransactionRequestLookupResponse(
        String externalRequestId
) {

    public static AccountTransactionRequestLookupResponse from(AccountTransaction accountTransaction) {
        return new AccountTransactionRequestLookupResponse(accountTransaction.getExternalRequestId());
    }
}
