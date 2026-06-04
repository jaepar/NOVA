package woorifisa.project.coreBanking.domain.accountTransaction.dto.response;

import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;

public record UpdateTransactionMemoResponse(
        String memo
) {
    public static UpdateTransactionMemoResponse from(AccountTransaction transaction) {
        return new UpdateTransactionMemoResponse(transaction.getMemo());
    }
}
