package woorifisa.project.backend.domain.wallet.service;

public record WalletChargeIdempotencyResult(
        Status status,
        String walletChargeRequestId,
        Long withdrawAccountId,
        Integer chargeAmount
) {

    public enum Status {
        STARTED,
        PROCESSING,
        COMPLETED
    }

    public static WalletChargeIdempotencyResult started(String walletChargeRequestId) {
        return new WalletChargeIdempotencyResult(Status.STARTED, walletChargeRequestId, null, null);
    }

    public static WalletChargeIdempotencyResult processing(String walletChargeRequestId) {
        return new WalletChargeIdempotencyResult(Status.PROCESSING, walletChargeRequestId, null, null);
    }

    public static WalletChargeIdempotencyResult completed(String walletChargeRequestId, Long withdrawAccountId, Integer chargeAmount) {
        return new WalletChargeIdempotencyResult(Status.COMPLETED, walletChargeRequestId, withdrawAccountId, chargeAmount);
    }

    public boolean isProcessing() {
        return status == Status.PROCESSING;
    }

    public boolean isCompleted() {
        return status == Status.COMPLETED;
    }

    public boolean matches(Long withdrawAccountId, Integer chargeAmount) {
        return this.withdrawAccountId.equals(withdrawAccountId)
                && this.chargeAmount.equals(chargeAmount);
    }
}
