package woorifisa.project.backend.global.response.status;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseExceptionResponseStatus implements ResponseStatus {

    SUCCESS("20000", "요청에 성공했습니다."),
    BAD_REQUEST("40000", "유효하지 않은 요청입니다."),
    NOT_FOUND("40400", "존재하지 않는 API입니다."),
    INTERNAL_SERVER_ERROR("50000", "서버 내부 오류입니다."),

    /*
     * auth
     */
    INVALID_PASSWORD_FORMAT("AUTH-001", "비밀번호는 영문+숫자+특수문자를 포함한 8~16자여야 합니다."),
    PASSWORD_CONFIRM_NOT_MATCHED("AUTH-002", "비밀번호와 비밀번호 확인이 일치하지 않습니다."),
    DUPLICATE_EMAIL("AUTH-003", "이미 가입된 이메일입니다."),
    EMAIL_NOT_FOUND("AUTH-004", "존재하지 않는 이메일입니다."),
    DELETED_USER("AUTH-005", "탈퇴한 사용자입니다."),
    PASSWORD_NOT_MATCHED("AUTH-006", "비밀번호가 일치하지 않습니다."),
    INVALID_EMAIL_FORMAT("AUTH-007", "올바른 이메일 형식이 아닙니다."),
    EMAIL_VERIFICATION_RESEND_TOO_EARLY("AUTH-008", "인증번호 재발송은 60초 후에 가능합니다."),
    EMAIL_VERIFICATION_SEND_FAILED("AUTH-009", "인증번호 이메일 발송에 실패했습니다."),
    EMAIL_VERIFICATION_CODE_EXPIRED_OR_NOT_FOUND("AUTH-010", "인증번호가 만료되었거나 존재하지 않습니다."),
    EMAIL_VERIFICATION_CODE_NOT_MATCHED("AUTH-011", "인증번호가 일치하지 않습니다."),
    UNAUTHORIZED_SESSION("AUTH-012", "유효한 로그인 세션이 아닙니다."),

    /*
     * wallet
     */
    WALLET_NOT_FOUND("WALLET-001", "월렛 정보를 찾을 수 없습니다.")
    ;

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
