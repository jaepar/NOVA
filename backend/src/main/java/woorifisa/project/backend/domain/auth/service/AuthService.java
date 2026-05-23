package woorifisa.project.backend.domain.auth.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.auth.dto.request.LoginRequest;
import woorifisa.project.backend.domain.auth.dto.request.SignupRequest;
import woorifisa.project.backend.domain.auth.dto.response.LoginResponse;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DUPLICATE_EMAIL;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DELETED_USER;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.EMAIL_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.INVALID_PASSWORD_FORMAT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.PASSWORD_CONFIRM_NOT_MATCHED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.PASSWORD_NOT_MATCHED;

@Service
@RequiredArgsConstructor
public class AuthService {

    // 비밀번호가 영문+숫자+특수문자를 포함한 8~16자인지 확인한다.
    // 프론트 + 백엔드 이중 검증 목적으로도 사용
    private static final String PASSWORD_PATTERN = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,16}$";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void signup(SignupRequest request) {
        validatePassword(request.password());
        validatePasswordConfirm(request.password(), request.passwordConfirm());
        validateDuplicateEmail(request.email());

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .birth(request.birth())
                .gender(request.gender())
                .hasResidenceCard(false)
                .hasCertificate(false)
                .hasDelete(false)
                .issuedTime(null)
                .build();

        userRepository.save(user);
    }

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new CustomException(EMAIL_NOT_FOUND));

        if (Boolean.TRUE.equals(user.getHasDelete())) {
            throw new CustomException(DELETED_USER);
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new CustomException(PASSWORD_NOT_MATCHED);
        }

        httpRequest.getSession();
        httpRequest.changeSessionId();
        HttpSession session = httpRequest.getSession();
        session.setAttribute("userId", user.getUserId());
        return LoginResponse.from(user.getUserId());
    }

    private void validatePassword(String password) {
        if (!password.matches(PASSWORD_PATTERN)) {
            throw new CustomException(INVALID_PASSWORD_FORMAT);
        }
    }

    private void validatePasswordConfirm(String password, String passwordConfirm) {
        if (!password.equals(passwordConfirm)) {
            throw new CustomException(PASSWORD_CONFIRM_NOT_MATCHED);
        }
    }

    private void validateDuplicateEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new CustomException(DUPLICATE_EMAIL);
        }
    }
}
