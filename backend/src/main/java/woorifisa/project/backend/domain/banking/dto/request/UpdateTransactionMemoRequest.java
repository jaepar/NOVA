package woorifisa.project.backend.domain.banking.dto.request;

import woorifisa.project.backend.global.exception.CustomException;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSACTION_MEMO_TOO_LONG;

public record UpdateTransactionMemoRequest(
        String memo
) {
    private static final int MAX_MEMO_LENGTH = 20;

    public UpdateTransactionMemoRequest normalized() {
        return new UpdateTransactionMemoRequest(normalizedMemo());
    }

    // 공백 메모는 메모 없음으로 저장하고, 앞뒤 공백은 제거한다.
    public String normalizedMemo() {
        if (memo == null || memo.isBlank()) {
            return null;
        }
        String trimmedMemo = memo.trim();
        if (trimmedMemo.length() > MAX_MEMO_LENGTH) {
            throw new CustomException(BANKING_TRANSACTION_MEMO_TOO_LONG);
        }
        return trimmedMemo;
    }
}
