package woorifisa.project.coreBanking.domain.wallet.dto.request;

public record DebitWalletAccountRequest(
        String walletChargeRequestId,
        Long customerId,
        Long withdrawAccountId,
        Long chargeAmount
) {
}
