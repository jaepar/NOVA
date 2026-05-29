package woorifisa.project.coreBanking.domain.account.dto.response;

public record RecipientLookupResponse(
        String recipientName
) {
    public static RecipientLookupResponse of(String recipientName) {
        return new RecipientLookupResponse(recipientName);
    }
}
