package woorifisa.project.backend.domain.banking.dto.response;

public record TransferPreviewResponse(
        MyAccount myAccount,
        Recipient recipient
) {
    public static TransferPreviewResponse of(
            String accountName,
            String accountNumber,
            Integer balance,
            Integer transferLimit,
            String userName,
            String recipientName
    ) {
        return new TransferPreviewResponse(
                new MyAccount(accountName, accountNumber, balance, transferLimit, userName),
                new Recipient(recipientName)
        );
    }

    public record MyAccount(
            String accountName,
            String accountNumber,
            Integer balance,
            Integer transferLimit,
            String userName
    ) {
    }

    public record Recipient(
            String recipientName
    ) {
    }
}
