package woorifisa.project.backend.domain.banking.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AccountCreateRequest(
        @NotBlank String accountType,
        @NotBlank String accountName,
        @NotNull @Valid CustomerInfo customerInfo,
        @NotBlank String job,
        @NotNull @Valid TransactionInfo transactionInfo,
        @NotNull Boolean hasForeignTax,
        @NotBlank String accountPassword
) {
    public record CustomerInfo(
            @NotBlank String address,
            @NotBlank String addressDetail
    ) {
    }

    public record TransactionInfo(
            @NotBlank String purpose,
            @NotBlank String source
    ) {
    }
}
