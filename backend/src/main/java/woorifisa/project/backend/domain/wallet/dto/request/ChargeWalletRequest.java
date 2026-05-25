package woorifisa.project.backend.domain.wallet.dto.request;

public record ChargeWalletRequest(
        Long withdrawAccountId,
        Integer chargeAmount
) {
}
