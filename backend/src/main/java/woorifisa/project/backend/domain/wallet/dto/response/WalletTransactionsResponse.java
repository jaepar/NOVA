package woorifisa.project.backend.domain.wallet.dto.response;

import org.springframework.data.domain.Slice;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;

import java.util.List;

public record WalletTransactionsResponse(
        Integer balance,
        List<WalletTransactionItem> transactions,
        int page,                                           // 현재 페이지 번호
        int size,                                           // 페이지 크기
        boolean hasNext
) {

    public static WalletTransactionsResponse from(Wallet wallet, Slice<WalletTransaction> transactions) {
        return new WalletTransactionsResponse(
                wallet.getBalance(),
                transactions.getContent().stream()
                        .map(WalletTransactionItem::from)
                        .toList(),
                transactions.getNumber(),
                transactions.getSize(),
                transactions.hasNext()
        );
    }
}
