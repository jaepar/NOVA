package woorifisa.project.backend.domain.wallet.dto.request;

public record DebitWalletAccountRequest(
        String walletChargeRequestId,
        Long customerId,
        Long withdrawAccountId,
        Integer chargeAmount
) {

    public static DebitWalletAccountRequest of(
            String walletChargeRequestId,
            Long customerId,
            Long withdrawAccountId,
            Integer chargeAmount
    ) {
        return new DebitWalletAccountRequest(
                walletChargeRequestId,
                customerId,
                withdrawAccountId,
                chargeAmount
        );
    }
}
