package woorifisa.project.backend.domain.banking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TransferRequest(
        @NotNull
        Long withdrawAccountId,         // 출금될 계좌(계좌 이체 시 사용자 계좌)
        @NotNull
        Long depositAccountId,          // 상대방 계좌 ID
        @NotNull
        @Positive
        Integer transferAmount,
        @NotBlank
        String accountPassword,
        @NotBlank
        String withdrawMemo,            // 내 통장 표기
        @NotBlank
        String depositMemo              // 받는 분 통장 표기
) {
}
