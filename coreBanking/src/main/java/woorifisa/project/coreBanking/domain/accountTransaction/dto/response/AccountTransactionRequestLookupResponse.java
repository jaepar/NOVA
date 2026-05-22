package woorifisa.project.coreBanking.domain.accountTransaction.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;

public record AccountTransactionRequestLookupResponse(
        String externalRequestId
) {

    public static AccountTransactionRequestLookupResponse found(String externalRequestId) {
        return new AccountTransactionRequestLookupResponse(externalRequestId);
    }

    public static AccountTransactionRequestLookupResponse notFound() {
        return new AccountTransactionRequestLookupResponse(null);
    }

    @JsonIgnore
    public boolean found() {
        return externalRequestId != null;
    }
}
