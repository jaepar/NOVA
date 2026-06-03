package woorifisa.project.backend.domain.wallet.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record ChargeWalletRequest(
        @NotNull
        @Positive
        Integer chargeAmount,

        @NotBlank
        @Pattern(regexp = "^\\d{4}$")
        String accountPassword
) {
}
