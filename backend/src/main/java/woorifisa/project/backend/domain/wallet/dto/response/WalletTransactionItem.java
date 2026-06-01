package woorifisa.project.backend.domain.wallet.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;

import java.time.LocalDateTime;

public record WalletTransactionItem(
        Long walletTransactionId,
        TransactionFlow transactionFlow,
        String counterparty,
        Integer amount,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt
) {

    public static WalletTransactionItem from(WalletTransaction walletTransaction) {
        return new WalletTransactionItem(
                walletTransaction.getWalletTransactionId(),
                walletTransaction.getTransactionFlow(),
                walletTransaction.getCounterparty(),
                walletTransaction.getAmount(),
                walletTransaction.getCreatedAt()
        );
    }
}
