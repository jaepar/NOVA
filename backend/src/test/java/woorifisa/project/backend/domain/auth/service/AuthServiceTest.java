package woorifisa.project.backend.domain.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import woorifisa.project.backend.domain.auth.dto.request.LoginRequest;
import woorifisa.project.backend.domain.auth.dto.request.SignupRequest;
import woorifisa.project.backend.domain.auth.dto.response.LoginResponse;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.Gender;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DELETED_USER;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DUPLICATE_EMAIL;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.EMAIL_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.EMAIL_VERIFICATION_CODE_EXPIRED_OR_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.EMAIL_VERIFICATION_CODE_NOT_MATCHED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.EMAIL_VERIFICATION_RESEND_TOO_EARLY;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.EMAIL_VERIFICATION_SEND_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.INVALID_EMAIL_FORMAT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.INVALID_PASSWORD_FORMAT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.PASSWORD_CONFIRM_NOT_MATCHED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.PASSWORD_NOT_MATCHED;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StringRedisTemplate stringRedisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Mock
    private JavaMailSender javaMailSender;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, stringRedisTemplate, javaMailSender);
        lenient().when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
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

    @Test
    @DisplayName("로그인 성공 시 세션에 userId를 저장하고 userId를 반환한다")
    void loginStoresUserIdInSession() {
        User user = createUser(false, passwordEncoder.encode("Password123!"));
        when(userRepository.findByEmail("login@test.com")).thenReturn(Optional.of(user));
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();
        String oldSessionId = httpRequest.getSession().getId();

        LoginResponse response = authService.login(
                new LoginRequest("login@test.com", "Password123!"),
                httpRequest
        );

        assertThat(response.userId()).isEqualTo(1L);
        assertThat(httpRequest.getSession().getId()).isNotEqualTo(oldSessionId);
        assertThat(httpRequest.getSession().getAttribute("userId")).isEqualTo(1L);
    }

    @Test
    @DisplayName("존재하지 않는 이메일이면 로그인에 실패한다")
    void loginFailsWhenEmailDoesNotExist() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertLoginFailed(() -> authService.login(
                new LoginRequest("missing@test.com", "Password123!"),
                new MockHttpServletRequest()
        ), EMAIL_NOT_FOUND);
    }

    @Test
    @DisplayName("비밀번호가 일치하지 않으면 로그인에 실패한다")
    void loginFailsWhenPasswordDoesNotMatch() {
        User user = createUser(false, passwordEncoder.encode("Password123!"));
        when(userRepository.findByEmail("login@test.com")).thenReturn(Optional.of(user));

        assertLoginFailed(() -> authService.login(
                new LoginRequest("login@test.com", "WrongPassword123!"),
                new MockHttpServletRequest()
        ), PASSWORD_NOT_MATCHED);
    }

    @Test
    @DisplayName("탈퇴한 사용자는 로그인에 실패한다")
    void loginFailsWhenUserIsDeleted() {
        User user = createUser(true, passwordEncoder.encode("Password123!"));
        when(userRepository.findByEmail("login@test.com")).thenReturn(Optional.of(user));

        assertLoginFailed(() -> authService.login(
                new LoginRequest("login@test.com", "Password123!"),
                new MockHttpServletRequest()
        ), DELETED_USER);
    }

    @Test
    @DisplayName("이메일 인증번호 발송 성공 시 메일 전송과 redis 저장을 수행한다")
    void sendEmailVerificationCodeSendsMailAndStoresCodeInRedis() {
        when(valueOperations.get(anyString())).thenReturn(null);

        authService.sendEmailVerificationCode("email@konkuk.ac.kr");

        verify(javaMailSender).send(any(SimpleMailMessage.class));
        verify(valueOperations, times(2)).set(anyString(), anyString(), any());
    }

    @Test
    @DisplayName("이메일 형식이 유효하지 않으면 인증번호 발송에 실패한다")
    void sendEmailVerificationCodeFailsWhenEmailFormatIsInvalid() {
        assertThatThrownBy(() -> authService.sendEmailVerificationCode("invalid-email"))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(INVALID_EMAIL_FORMAT);
    }

    @Test
    @DisplayName("재발송 쿨다운 중이면 인증번호 발송에 실패한다")
    void sendEmailVerificationCodeFailsWhenCooldownExists() {
        when(valueOperations.get(anyString())).thenReturn("1");

        assertThatThrownBy(() -> authService.sendEmailVerificationCode("email@konkuk.ac.kr"))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(EMAIL_VERIFICATION_RESEND_TOO_EARLY);
    }

    @Test
    @DisplayName("SMTP 발송 실패 시 인증번호 발송 실패 예외를 반환한다")
    void sendEmailVerificationCodeFailsWhenMailSendFails() {
        when(valueOperations.get(anyString())).thenReturn(null);
        org.mockito.Mockito.doThrow(new MailSendException("send fail"))
                .when(javaMailSender).send(any(SimpleMailMessage.class));

        assertThatThrownBy(() -> authService.sendEmailVerificationCode("email@konkuk.ac.kr"))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(EMAIL_VERIFICATION_SEND_FAILED);
    }

    @Test
    @DisplayName("이메일 인증번호 확인 성공 시 인증코드 키를 삭제한다")
    void confirmEmailVerificationCodeDeletesCodeKeyWhenValid() {
        String email = "email@konkuk.ac.kr";
        String code = "123456";
        when(valueOperations.get("auth:email-verification:code:" + email))
                .thenReturn(hashForTest(code));

        authService.confirmEmailVerificationCode(email, code);

        verify(stringRedisTemplate).delete("auth:email-verification:code:" + email);
    }

    @Test
    @DisplayName("이메일 인증번호가 만료되었거나 없으면 확인에 실패한다")
    void confirmEmailVerificationCodeFailsWhenCodeMissing() {
        String email = "email@konkuk.ac.kr";
        when(valueOperations.get("auth:email-verification:code:" + email)).thenReturn(null);

        assertThatThrownBy(() -> authService.confirmEmailVerificationCode(email, "123456"))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(EMAIL_VERIFICATION_CODE_EXPIRED_OR_NOT_FOUND);
    }

    @Test
    @DisplayName("이메일 인증번호가 일치하지 않으면 확인에 실패한다")
    void confirmEmailVerificationCodeFailsWhenCodeNotMatched() {
        String email = "email@konkuk.ac.kr";
        when(valueOperations.get("auth:email-verification:code:" + email)).thenReturn(hashForTest("654321"));

        assertThatThrownBy(() -> authService.confirmEmailVerificationCode(email, "123456"))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(EMAIL_VERIFICATION_CODE_NOT_MATCHED);
    }

    private void assertLoginFailed(Runnable action, Object exceptionStatus) {
        assertThatThrownBy(action::run)
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(exceptionStatus);
    }

    private User createUser(boolean hasDelete, String password) {
        return User.builder()
                .userId(1L)
                .name("Login Test User")
                .birth("020215")
                .gender(Gender.MALE)
                .email("login@test.com")
                .password(password)
                .hasResidenceCard(false)
                .hasCertificate(false)
                .hasDelete(hasDelete)
                .issuedTime(null)
                .build();
    }

    private String hashForTest(String code) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = messageDigest.digest((code + "nova-email-verification-salt")
                    .getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
