package woorifisa.project.coreBanking.domain.account.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AccountPasswordVerifyRequest(
        @NotNull
        Long accountId,
        @NotBlank
        @Pattern(regexp = "^\\d{4}$")
        String accountPassword
) {
}
