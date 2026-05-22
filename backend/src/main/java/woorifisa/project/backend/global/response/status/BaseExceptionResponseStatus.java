package woorifisa.project.backend.global.response.status;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseExceptionResponseStatus implements ResponseStatus {

    SUCCESS("20000", "요청에 성공했습니다."),
    BAD_REQUEST("40000", "유효하지 않은 요청입니다."),
    NOT_FOUND("40400", "존재하지 않는 API입니다."),
    INTERNAL_SERVER_ERROR("50000", "서버 내부 오류입니다."),

    /*
     * auth : 300
     */
    INVALID_PASSWORD_FORMAT("AUTH-001", "비밀번호는 영문+숫자+특수문자를 포함한 8~16자여야 합니다."),
    PASSWORD_CONFIRM_NOT_MATCHED("AUTH-002", "비밀번호와 비밀번호 확인이 일치하지 않습니다."),
    DUPLICATE_EMAIL("AUTH-003", "이미 가입된 이메일입니다."),
    LOGIN_FAILED("AUTH-004", "이메일 또는 비밀번호가 올바르지 않습니다.");

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
