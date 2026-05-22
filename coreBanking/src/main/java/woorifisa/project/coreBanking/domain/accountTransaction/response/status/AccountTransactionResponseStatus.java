package woorifisa.project.coreBanking.domain.accountTransaction.response.status;

import lombok.RequiredArgsConstructor;
import woorifisa.project.coreBanking.global.response.status.ResponseStatus;

@RequiredArgsConstructor
public enum AccountTransactionResponseStatus implements ResponseStatus {
    REQUEST_FOUND(true, 20000, "거래 처리 내역이 확인되었습니다."),
    REQUEST_NOT_FOUND(false, 40410, "거래 처리 내역을 찾을 수 없습니다.");

    private final boolean success;
    private final int code;
    private final String message;

    @Override
    public boolean getSuccess() {
        return success;
    }

    @Override
    public int getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
