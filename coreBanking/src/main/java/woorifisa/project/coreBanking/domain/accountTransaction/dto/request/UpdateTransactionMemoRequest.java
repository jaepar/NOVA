package woorifisa.project.coreBanking.domain.accountTransaction.dto.request;

public record UpdateTransactionMemoRequest(
        String memo
) {
    // 공백 메모는 메모 없음으로 저장하고, 앞뒤 공백은 제거한다.
    public String normalizedMemo() {
        if (memo == null || memo.isBlank()) {
            return null;
        }
        return memo.trim();
    }
}
