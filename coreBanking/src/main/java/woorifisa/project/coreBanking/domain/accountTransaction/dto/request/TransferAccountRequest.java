package woorifisa.project.coreBanking.domain.accountTransaction.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TransferAccountRequest(
        @NotBlank
        String externalRequestId,
        @NotBlank
        String withdrawAccountId,
        @NotBlank
        String depositAccountId,
        @NotNull
        @Positive
        Integer transferAmount
) {
}
