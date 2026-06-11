package woorifisa.project.backend.domain.banking.dto.request;

import java.time.LocalDate;

public record TransactionDateRange(
        LocalDate from,
        LocalDate to
) {
}
