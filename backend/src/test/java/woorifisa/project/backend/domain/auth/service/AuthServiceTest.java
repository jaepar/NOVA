package woorifisa.project.backend.domain.auth.service;

import org.junit.jupiter.api.BeforeEach;
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
    void signupEncryptsPasswordAndSavesUser() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123",
                "Password123",
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
    void signupFailsWhenPasswordConfirmDoesNotMatch() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123",
                "Password124",
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
    void signupFailsWhenPasswordFormatIsInvalid() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "password",
                "password",
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
    void signupFailsWhenEmailAlreadyExists() {
        SignupRequest request = new SignupRequest(
                "email@konkuk.ac.kr",
                "Password123",
                "Password123",
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
