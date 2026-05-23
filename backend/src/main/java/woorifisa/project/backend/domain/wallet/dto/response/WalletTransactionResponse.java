package woorifisa.project.backend.domain.wallet.dto.response;

import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;

import java.time.LocalDateTime;

public record WalletTransactionResponse(
        Long walletTransactionId,
        TransactionFlow transactionFlow,
        String counterparty,
        Integer amount,
        LocalDateTime createdAt
) {

    public static WalletTransactionResponse from(WalletTransaction walletTransaction) {
        return new WalletTransactionResponse(
                walletTransaction.getWalletTransactionId(),
                walletTransaction.getTransactionFlow(),
                walletTransaction.getCounterparty(),
                walletTransaction.getAmount(),
                walletTransaction.getCreatedAt()
        );
    }
}
