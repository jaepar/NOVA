package woorifisa.project.backend.domain.wallet.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ChargeWalletRequest(
        @NotNull
        @Positive
        Integer chargeAmount
) {
}
