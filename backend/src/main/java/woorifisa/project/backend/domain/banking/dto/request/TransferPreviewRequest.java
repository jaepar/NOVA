package woorifisa.project.backend.domain.banking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TransferPreviewRequest(
        @NotBlank
        String recipientBankCode,
        @NotBlank
        @Pattern(regexp = "^\\d{10,20}$")
        String recipientAccountNumber
) {
}
