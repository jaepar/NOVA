package woorifisa.project.backend.domain.banking.dto.response;

public record TransferPreviewResponse(
        MyAccount myAccount,
        Recipient recipient
) {
    public static TransferPreviewResponse of(String accountName, String accountNumber, String recipientName) {
        return new TransferPreviewResponse(
                new MyAccount(accountName, accountNumber),
                new Recipient(recipientName)
        );
    }

    public record MyAccount(
            String accountName,
            String accountNumber
    ) {
    }

    public record Recipient(
            String recipientName
    ) {
    }
}
