package woorifisa.project.coreBanking.global.response.status;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseResponseStatus implements ResponseStatus {
    SUCCESS("20000", "요청에 성공했습니다."),
    BAD_REQUEST("40000", "유효하지 않은 요청입니다."),
    NOT_FOUND("40400", "대상을 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR("50000", "서버 내부 오류입니다."),

    /*
     * accountTransaction
     */
    ACCOUNT_TRANSACTION_NOT_FOUND("ACCOUNT_TRANSACTION-001", "거래 처리 내역을 찾을 수 없습니다.");

    private final boolean success = false;
    private final String code;
    private final String message;

    @Override
    public boolean getSuccess() {
        return success;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
