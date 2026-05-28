package woorifisa.project.coreBanking.domain.accountTransaction.dto.response;

public record AccountTransactionRequestLookupResponse(
        String externalRequestId
) {

    public static AccountTransactionRequestLookupResponse of(String externalRequestId) {
        return new AccountTransactionRequestLookupResponse(externalRequestId);
    }
}
