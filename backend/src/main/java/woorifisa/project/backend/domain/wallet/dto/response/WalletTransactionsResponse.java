package woorifisa.project.backend.domain.wallet.dto.response;

import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;

import java.util.List;

public record WalletTransactionsResponse(
        Integer balance,
        List<WalletTransactionResponse> transactions
) {

    public static WalletTransactionsResponse from(Wallet wallet, List<WalletTransaction> transactions) {
        return new WalletTransactionsResponse(
                wallet.getBalance(),
                transactions.stream()
                        .map(WalletTransactionResponse::from)
                        .toList()
        );
    }
}
