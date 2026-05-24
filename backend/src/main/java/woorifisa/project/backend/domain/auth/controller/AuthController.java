package woorifisa.project.backend.domain.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.domain.auth.dto.request.EmailVerificationSendRequest;
import woorifisa.project.backend.domain.auth.dto.request.LoginRequest;
import woorifisa.project.backend.domain.auth.dto.request.SignupRequest;
import woorifisa.project.backend.domain.auth.dto.response.LoginResponse;
import woorifisa.project.backend.domain.auth.service.AuthService;
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

    @PostMapping("/email-verifications")
    public BaseResponse<Void> sendEmailVerificationCode(
            @Valid @RequestBody EmailVerificationSendRequest request
    ) {
        authService.sendEmailVerificationCode(request.email());
        return BaseResponse.ok(null);
    }
}
