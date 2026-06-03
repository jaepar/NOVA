package woorifisa.project.backend.global.corebanking.client.dto.request;

public record CoreBankingWalletDebitRequest(
        String walletChargeRequestId,
        Long customerId,
        Long withdrawAccountId,
        Integer chargeAmount
) {
}
