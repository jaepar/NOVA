package woorifisa.project.backend.global.response.status;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseExceptionResponseStatus implements ResponseStatus {

    SUCCESS(20000, "요청이 성공했습니다."),
    BAD_REQUEST(40000, "유효하지 않은 요청입니다."),
    UNAUTHORIZED(40100, "인증이 필요합니다."),
    NOT_FOUND(40400, "존재하지 않는 API입니다."),
    WALLET_INVALID_CHARGE_AMOUNT(41001, "월렛 충전 금액이 올바르지 않습니다."),
    WALLET_NOT_FOUND(41002, "월렛을 찾을 수 없습니다."),
    WALLET_ACCOUNT_NOT_FOUND(41003, "출금 계좌를 찾을 수 없습니다."),
    WALLET_DEBIT_FAILED(41004, "계좌 차감이 실패했습니다."),
    INTERNAL_SERVER_ERROR(50000, "서버 내부 오류입니다.");

    private final boolean success = false;
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
