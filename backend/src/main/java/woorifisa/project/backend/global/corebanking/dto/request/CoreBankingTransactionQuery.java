package woorifisa.project.backend.global.corebanking.dto.request;

import org.springframework.data.domain.Sort;
import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;

import java.time.LocalDate;

public record CoreBankingTransactionQuery(
        Long accountId,
        LocalDate from,
        LocalDate to,
        TransactionFlowFilter flow,
        String keyword,
        Sort.Direction sortDirection,
        int page,
        int size
) {
}
