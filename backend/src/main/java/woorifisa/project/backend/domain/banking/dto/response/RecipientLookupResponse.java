package woorifisa.project.backend.domain.banking.dto.response;

public record RecipientLookupResponse(
        String recipientName
) {
    public static RecipientLookupResponse of(String recipientName) {
        return new RecipientLookupResponse(recipientName);
    }
}
