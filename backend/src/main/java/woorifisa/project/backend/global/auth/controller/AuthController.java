package woorifisa.project.backend.global.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.global.auth.dto.request.EmailVerificationConfirmRequest;
import woorifisa.project.backend.global.auth.dto.request.EmailVerificationSendRequest;
import woorifisa.project.backend.global.auth.dto.request.LoginRequest;
import woorifisa.project.backend.global.auth.dto.request.SignupRequest;
import woorifisa.project.backend.global.auth.dto.response.LoginResponse;
import woorifisa.project.backend.global.auth.dto.response.SessionCheckResponse;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.auth.service.AuthService;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public BaseResponse<Void> signup(
            @Valid @RequestBody SignupRequest request
    ) {
        authService.signup(request);
        return BaseResponse.ok(null);
    }

    @PostMapping("/login")
    public BaseResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        return BaseResponse.ok(authService.login(request, httpRequest));
    }

    @PostMapping("/logout")
    public BaseResponse<Void> logout(
            HttpServletRequest httpRequest
    ) {
        authService.logout(httpRequest);
        return BaseResponse.ok(null);
    }

    // 새로고침 시 세션 유효성 검증하는 API
    @GetMapping("/me")
    public BaseResponse<SessionCheckResponse> me(
            @AuthenticationPrincipal SessionUserPrincipal principal
    ) {
        return BaseResponse.ok(SessionCheckResponse.from(principal.userId()));
    }

    @PostMapping("/email-verifications")
    public BaseResponse<Void> sendEmailVerificationCode(
            @Valid @RequestBody EmailVerificationSendRequest request
    ) {
        authService.sendEmailVerificationCode(request.email());
        return BaseResponse.ok(null);
    }

    @PostMapping("/email-verifications/confirm")
    public BaseResponse<Void> confirmEmailVerificationCode(
            @Valid @RequestBody EmailVerificationConfirmRequest request
    ) {
        authService.confirmEmailVerificationCode(request.email(), request.code());
        return BaseResponse.ok(null);
    }
}
