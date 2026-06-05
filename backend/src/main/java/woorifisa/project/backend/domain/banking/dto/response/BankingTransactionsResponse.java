package woorifisa.project.backend.domain.banking.dto.response;

import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;
import woorifisa.project.backend.domain.banking.dto.request.TransactionPeriod;

import java.time.LocalDateTime;
import java.util.List;

public record BankingTransactionsResponse(
        Long accountId,
        TransactionPeriod period,
        TransactionFlowFilter flow,
        List<Transaction> transactions,
        int page,
        int size,
        boolean hasNext
) {
    public static BankingTransactionsResponse of(
            TransactionPeriod period,
            TransactionFlowFilter flow,
            CoreBankingTransactionsResponse response
    ) {
        List<Transaction> transactions = response.transactions() == null
                ? List.of()
                : response.transactions().stream()
                .map(Transaction::from)
                .toList();

        return new BankingTransactionsResponse(
                response.accountId(),
                period,
                flow,
                transactions,
                response.page(),
                response.size(),
                response.hasNext()
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
        private static Transaction from(CoreBankingTransactionsResponse.Transaction transaction) {
            return new Transaction(
                    transaction.transactionId(),
                    transaction.transactionFlow(),
                    transaction.transactionType(),
                    transaction.counterParty(),
                    transaction.amount(),
                    transaction.balanceAfter(),
                    transaction.memo(),
                    transaction.transactionDateTime()
            );
        }
    }
}
