package woorifisa.project.backend.domain.wallet.dto.corebanking.request;

public record CoreBankingWalletDebitRequest(
        String walletChargeRequestId,
        Long customerId,
        Long withdrawAccountId,
        Integer chargeAmount
) {
}
