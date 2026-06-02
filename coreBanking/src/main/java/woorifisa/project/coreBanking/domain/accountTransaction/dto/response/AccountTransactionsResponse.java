package woorifisa.project.coreBanking.domain.accountTransaction.dto.response;

import org.springframework.data.domain.Slice;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;

import java.time.LocalDateTime;
import java.util.List;

public record AccountTransactionsResponse(
        Long accountId,
        List<Transaction> transactions,
        int page,
        int size,
        boolean hasNext
) {
    public static AccountTransactionsResponse of(Long accountId, Slice<AccountTransaction> transactions) {
        return new AccountTransactionsResponse(
                accountId,
                transactions.getContent().stream()
                        .map(Transaction::from)
                        .toList(),
                transactions.getNumber(),
                transactions.getSize(),
                transactions.hasNext()
        );
    }

    public record Transaction(
            Long transactionId,
            String transactionFlow,
            String transactionType,
            String counterParty,
            Integer amount,
            Integer balanceAfter,
            String memo,
            LocalDateTime transactionDateTime
    ) {
        private static Transaction from(AccountTransaction transaction) {
            return new Transaction(
                    transaction.getAccountTransactionId(),
                    transaction.getTransactionFlow().name(),
                    transaction.getTransactionType().name(),
                    transaction.getCounterParty(),
                    transaction.getAmount(),
                    transaction.getBalanceAfter(),
                    transaction.getMemo(),
                    transaction.getCreatedAt()
            );
        }
    }
}
