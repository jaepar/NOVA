package woorifisa.project.backend.domain.banking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TransferRequest(
        @NotBlank
        String withdrawAccountId,       // 출금될 계좌번호(계좌 이체 시 사용자 계좌)
        @NotBlank
        String depositAccountId,        // 상대방 계좌번호
        @NotNull
        @Positive
        Integer transferAmount,
        @NotBlank
        String accountPassword
) {
}
