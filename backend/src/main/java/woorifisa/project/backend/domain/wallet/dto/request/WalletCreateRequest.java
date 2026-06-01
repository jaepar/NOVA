package woorifisa.project.backend.domain.wallet.dto.request;

import jakarta.validation.constraints.NotNull;

public record WalletCreateRequest(
        @NotNull
        Boolean termsAgreed
) {
}
