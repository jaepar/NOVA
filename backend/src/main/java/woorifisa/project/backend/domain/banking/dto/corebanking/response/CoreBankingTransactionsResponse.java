package woorifisa.project.backend.domain.banking.dto.corebanking.response;

import java.time.LocalDateTime;
import java.util.List;

public record CoreBankingTransactionsResponse(
        Long accountId,
        List<Transaction> transactions,
        int page,
        int size,
        boolean hasNext
) {
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
    }
}
