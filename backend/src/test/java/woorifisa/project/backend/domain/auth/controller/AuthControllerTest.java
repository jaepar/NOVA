package woorifisa.project.backend.domain.auth.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import woorifisa.project.backend.domain.user.entity.enums.Gender;
import woorifisa.project.backend.global.auth.controller.AuthController;
import woorifisa.project.backend.global.auth.dto.request.EmailVerificationConfirmRequest;
import woorifisa.project.backend.global.auth.dto.request.EmailVerificationSendRequest;
import woorifisa.project.backend.global.auth.dto.request.LoginRequest;
import woorifisa.project.backend.global.auth.dto.request.SignupRequest;
import woorifisa.project.backend.global.auth.dto.response.LoginResponse;
import woorifisa.project.backend.global.auth.service.AuthService;
import woorifisa.project.backend.global.response.BaseResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    private final AuthService authService = mock(AuthService.class);
    private final AuthController authController = new AuthController(authService);

    @Test
    @DisplayName("회원가입 성공 시 공통 성공 응답을 반환한다")
    void signupReturnsSignupSuccessStatus() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123!",
                "Password123!",
                "string",
                "020215",
                Gender.MALE
        );

        BaseResponse<Void> response = authController.signup(request);

        verify(authService).signup(request);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getMessage()).isEqualTo("요청에 성공했습니다.");
        assertThat(response.getData()).isNull();
    }

    @Test
    @DisplayName("로그인 성공 시 userId를 공통 응답으로 반환한다")
    void loginReturnsUserId() {
        LoginRequest request = new LoginRequest("email@konkuk.ac.kr", "Password123!");
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();
        when(authService.login(request, httpRequest)).thenReturn(LoginResponse.from(1L));

        BaseResponse<LoginResponse> response = authController.login(request, httpRequest);

        verify(authService).login(request, httpRequest);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getMessage()).isEqualTo("요청에 성공했습니다.");
        assertThat(response.getData().userId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("로그아웃 성공 시 서비스에 위임하고 공통 성공 응답을 반환한다")
    void logoutReturnsSuccess() {
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();
        MockHttpServletResponse httpResponse = new MockHttpServletResponse();

        BaseResponse<Void> response = authController.logout(httpRequest, httpResponse);

        verify(authService).logout(httpRequest, httpResponse);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getMessage()).isEqualTo("요청에 성공했습니다.");
        assertThat(response.getData()).isNull();
    }

    @Test
    @DisplayName("이메일 인증번호 발송 성공 시 공통 성공 응답을 반환한다")
    void sendEmailVerificationCodeReturnsSuccess() {
        EmailVerificationSendRequest request = new EmailVerificationSendRequest("email@konkuk.ac.kr");

        BaseResponse<Void> response = authController.sendEmailVerificationCode(request);

        verify(authService).sendEmailVerificationCode(request.email());
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getMessage()).isEqualTo("요청에 성공했습니다.");
        assertThat(response.getData()).isNull();
    }

    @Test
    @DisplayName("이메일 인증번호 확인 성공 시 공통 성공 응답을 반환한다")
    void confirmEmailVerificationCodeReturnsSuccess() {
        EmailVerificationConfirmRequest request = new EmailVerificationConfirmRequest(
                "email@konkuk.ac.kr",
                "123456"
        );

        BaseResponse<Void> response = authController.confirmEmailVerificationCode(request);

        verify(authService).confirmEmailVerificationCode(request.email(), request.code());
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getMessage()).isEqualTo("요청에 성공했습니다.");
        assertThat(response.getData()).isNull();
    }
}
