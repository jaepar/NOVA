package woorifisa.project.backend.domain.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import woorifisa.project.backend.domain.auth.dto.request.SignupRequest;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.Gender;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DUPLICATE_EMAIL;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.INVALID_PASSWORD_FORMAT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.PASSWORD_CONFIRM_NOT_MATCHED;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("정상 회원가입 시 비밀번호를 암호화하고 사용자를 저장한다")
    void signupEncryptsPasswordAndSavesUser() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123!",
                "Password123!",
                "string",
                "020215",
                Gender.MALE
        );

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.signup(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();

        assertThat(savedUser.getEmail()).isEqualTo(request.email());
        assertThat(savedUser.getName()).isEqualTo(request.name());
        assertThat(savedUser.getBirth()).isEqualTo(request.birth());
        assertThat(savedUser.getGender()).isEqualTo(request.gender());
        assertThat(savedUser.getPassword()).isNotEqualTo(request.password());
        assertThat(passwordEncoder.matches(request.password(), savedUser.getPassword())).isTrue();
        assertThat(savedUser.getHasResidenceCard()).isFalse();
        assertThat(savedUser.getHasCertificate()).isFalse();
        assertThat(savedUser.getHasDelete()).isFalse();
        assertThat(savedUser.getIssuedTime()).isNull();
    }

    @Test
    @DisplayName("비밀번호와 비밀번호 확인이 일치하지 않으면 회원가입에 실패한다")
    void signupFailsWhenPasswordConfirmDoesNotMatch() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123!",
                "Password124!",
                "string",
                "020215",
                Gender.MALE
        );

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(PASSWORD_CONFIRM_NOT_MATCHED);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("비밀번호 형식이 올바르지 않으면 회원가입에 실패한다")
    void signupFailsWhenPasswordFormatIsInvalid() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123",
                "Password123",
                "string",
                "020215",
                Gender.MALE
        );

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(INVALID_PASSWORD_FORMAT);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("비밀번호 형식 오류 메시지를 정책과 일치하게 반환한다")
    void invalidPasswordFormatMessageMatchesPolicy() {
        assertThat(INVALID_PASSWORD_FORMAT.getMessage())
                .isEqualTo("비밀번호는 영문+숫자+특수문자를 포함한 8~16자여야 합니다.");
    }

    @Test
    @DisplayName("이미 가입된 이메일이면 회원가입에 실패한다")
    void signupFailsWhenEmailAlreadyExists() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123!",
                "Password123!",
                "string",
                "020215",
                Gender.MALE
        );

        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(DUPLICATE_EMAIL);

        verify(userRepository, never()).save(any(User.class));
    }
}
