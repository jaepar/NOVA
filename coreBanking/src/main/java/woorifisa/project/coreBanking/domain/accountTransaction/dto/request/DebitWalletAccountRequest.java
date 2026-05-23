package woorifisa.project.coreBanking.domain.accountTransaction.dto.request;

public record DebitWalletAccountRequest(
        String walletChargeRequestId,
        Long customerId,
        Long withdrawAccountId,
        Integer chargeAmount
) {
}
