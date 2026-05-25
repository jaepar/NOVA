package woorifisa.project.backend.global.response.status;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseExceptionResponseStatus implements ResponseStatus {

    SUCCESS("20000", "요청이 성공했습니다."),
    BAD_REQUEST("40000", "유효하지 않은 요청입니다."),
    UNAUTHORIZED("40100", "인증이 필요합니다."),
    NOT_FOUND("40400", "존재하지 않는 API입니다."),
    INTERNAL_SERVER_ERROR("50000", "서버 내부 오류입니다."),

    /*
     * wallet
     */
    WALLET_CHARGE_INVALID_REQUEST("WALLET_CHARGE-001", "월렛 충전 요청이 올바르지 않습니다."),
    WALLET_INVALID_CHARGE_AMOUNT("WALLET_CHARGE-002", "월렛 충전 금액이 올바르지 않습니다."),
    WALLET_NOT_FOUND("WALLET_CHARGE-003", "월렛을 찾을 수 없습니다."),
    WALLET_ACCOUNT_NOT_FOUND("WALLET_CHARGE-004", "출금 계좌를 찾을 수 없습니다."),
    WALLET_DEBIT_FAILED("WALLET_CHARGE-005", "계좌 차감이 실패했습니다."),
    WALLET_CHARGE_IN_PROGRESS("WALLET_CHARGE-006", "월렛 충전 요청이 처리 중입니다."),
    WALLET_IDEMPOTENCY_KEY_REQUIRED("WALLET_CHARGE-007", "Idempotency-Key가 필요합니다."),
    WALLET_IDEMPOTENCY_KEY_CONFLICT("WALLET_CHARGE-008", "동일한 Idempotency-Key로 다른 요청을 처리할 수 없습니다.");

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
