package woorifisa.project.backend.domain.auth.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.backend.domain.auth.dto.request.SignupRequest;
import woorifisa.project.backend.domain.auth.service.AuthService;
import woorifisa.project.backend.domain.user.entity.enums.Gender;
import woorifisa.project.backend.global.response.BaseResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class AuthControllerTest {

    private final AuthService authService = mock(AuthService.class);
    private final AuthController authController = new AuthController(authService);

    @Test
    @DisplayName("회원가입 성공 시 공통 성공 응답을 반환한다")
    void signupReturnsSignupSuccessStatus() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123",
                "Password123",
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
}
