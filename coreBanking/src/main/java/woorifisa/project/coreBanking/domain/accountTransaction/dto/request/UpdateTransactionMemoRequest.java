package woorifisa.project.coreBanking.domain.accountTransaction.dto.request;

import woorifisa.project.coreBanking.global.exception.CustomException;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSACTION_MEMO_TOO_LONG;

public record UpdateTransactionMemoRequest(
        String memo
) {
    private static final int MAX_MEMO_LENGTH = 20;

    // 공백 메모는 메모 없음으로 저장하고, 앞뒤 공백은 제거한다.
    public String normalizedMemo() {
        if (memo == null || memo.isBlank()) {
            return null;
        }
        String trimmedMemo = memo.trim();
        if (trimmedMemo.length() > MAX_MEMO_LENGTH) {
            throw new CustomException(ACCOUNT_TRANSACTION_MEMO_TOO_LONG);
        }
        return trimmedMemo;
    }
}
