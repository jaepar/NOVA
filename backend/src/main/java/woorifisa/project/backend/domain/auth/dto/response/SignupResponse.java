package woorifisa.project.backend.domain.auth.dto.response;

public record SignupResponse(
        boolean success,
        int code,
        String message
) {
    private static final int SIGNUP_SUCCESS_CODE = 20100;
    private static final String SIGNUP_SUCCESS_MESSAGE = "회원가입이 완료되었습니다.";

    public static SignupResponse signupSuccess() {
        return new SignupResponse(true, SIGNUP_SUCCESS_CODE, SIGNUP_SUCCESS_MESSAGE);
    }
}
