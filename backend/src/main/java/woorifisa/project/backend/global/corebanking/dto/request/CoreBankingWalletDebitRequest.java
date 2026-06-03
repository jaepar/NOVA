package woorifisa.project.backend.global.corebanking.dto.request;

public record CoreBankingWalletDebitRequest(
        String walletChargeRequestId,
        Long customerId,
        Long withdrawAccountId,
        Integer chargeAmount
) {
}
