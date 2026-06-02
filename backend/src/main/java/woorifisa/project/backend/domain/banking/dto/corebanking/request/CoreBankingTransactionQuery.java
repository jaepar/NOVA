package woorifisa.project.backend.domain.banking.dto.corebanking.request;

import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;

import java.time.LocalDate;

public record CoreBankingTransactionQuery(
        Long accountId,
        LocalDate from,
        LocalDate to,
        TransactionFlowFilter flow,
        int page,
        int size
) {
}
