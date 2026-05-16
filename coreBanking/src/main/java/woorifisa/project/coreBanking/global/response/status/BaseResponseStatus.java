package woorifisa.project.coreBanking.global.response.status;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseResponseStatus implements ResponseStatus {
    SUCCESS(true, 20000, "요청에 성공했습니다."),
    BAD_REQUEST(false, 40000, "유효하지 않은 요청입니다."),
    NOT_FOUND(false, 40400, "대상을 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(false, 50000, "서버 내부 오류입니다.");

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
