package woorifisa.project.backend.domain.auth.controller;

import org.junit.jupiter.api.Test;
import woorifisa.project.backend.domain.auth.dto.request.SignupRequest;
import woorifisa.project.backend.domain.auth.dto.response.SignupResponse;
import woorifisa.project.backend.domain.auth.service.AuthService;
import woorifisa.project.backend.domain.user.entity.enums.Gender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class AuthControllerTest {

    private final AuthService authService = mock(AuthService.class);
    private final AuthController authController = new AuthController(authService);

    @Test
    void signupReturnsSignupSuccessStatus() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123",
                "Password123",
                "string",
                "020215",
                Gender.MALE
        );

        SignupResponse response = authController.signup(request);

        verify(authService).signup(request);
        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo(20100);
        assertThat(response.message()).isEqualTo(SignupResponse.signupSuccess().message());
    }
}
