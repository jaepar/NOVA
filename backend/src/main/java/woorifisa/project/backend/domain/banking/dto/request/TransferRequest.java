package woorifisa.project.backend.domain.banking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TransferRequest(
        @NotNull
        Long withdrawAccountId,         // 출금될 계좌(계좌 이체 시 사용자 계좌)
        @NotBlank
        String depositBankCode,         // 상대방 은행 코드
        @NotBlank
        String depositAccountNumber,    // 상대방 계좌 번호
        @NotBlank
        String depositAccountHolderName,
        @NotNull
        @Positive
        Integer transferAmount,
        @NotBlank
        String withdrawMemo,            // 내 통장 표기
        @NotBlank
        String depositMemo              // 받는 분 통장 표기
) {
}
