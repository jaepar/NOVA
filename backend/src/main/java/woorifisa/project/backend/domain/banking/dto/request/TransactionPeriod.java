package woorifisa.project.backend.domain.banking.dto.request;

import java.time.LocalDate;

public enum TransactionPeriod {
    ONE_WEEK {
        @Override
        public LocalDate from(LocalDate today) {
            return today.minusWeeks(1);
        }
    },
    ONE_MONTH {
        @Override
        public LocalDate from(LocalDate today) {
            return today.minusMonths(1);
        }
    },
    CUSTOM {
        @Override
        public LocalDate from(LocalDate today) {
            throw new UnsupportedOperationException("CUSTOM period requires explicit from/to dates");
        }
    };

    public abstract LocalDate from(LocalDate today);
}
