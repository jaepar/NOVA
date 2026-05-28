package woorifisa.project.coreBanking.domain.accountTransaction.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TransferAccountRequest(
        @NotBlank
        String externalRequestId,
        @NotNull
        Long withdrawAccountId,
        @NotNull
        Long depositAccountId,
        @NotNull
        @Positive
        Integer transferAmount,
        @NotBlank
        String withdrawMemo,
        @NotBlank
        String depositMemo
) {
}
