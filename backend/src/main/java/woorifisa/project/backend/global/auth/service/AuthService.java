package woorifisa.project.backend.global.auth.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.HexFormat;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.auth.dto.request.LoginRequest;
import woorifisa.project.backend.global.auth.dto.request.SignupRequest;
import woorifisa.project.backend.global.auth.dto.response.LoginResponse;
import woorifisa.project.backend.global.exception.CustomException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    // 비밀번호가 영문+숫자+특수문자를 포함한 8~16자인지 확인한다.
    // 프론트 + 백엔드 이중 검증 목적으로도 사용
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,16}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final String EMAIL_VERIFICATION_CODE_KEY = "auth:email-verification:code:%s";
    private static final String EMAIL_VERIFICATION_COOLDOWN_KEY = "auth:email-verification:cooldown:%s";
    private static final String HASH_SALT = "nova-email-verification-salt";
    private static final int EMAIL_CODE_LENGTH = 6;
    private static final Duration EMAIL_CODE_TTL = Duration.ofMinutes(5);
    private static final Duration EMAIL_RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate stringRedisTemplate;
    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

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
                .certificateStatus(CertificateStatus.NOT_ISSUED)
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

        httpRequest.getSession(true);
        httpRequest.changeSessionId();
        HttpSession session = httpRequest.getSession(false);
        session.setAttribute("userId", user.getUserId());
        log.info("login session created. sessionClass={}, sessionId={}, userId={}",
                session.getClass().getName(),
                session.getId(),
                user.getUserId());
        return LoginResponse.from(user.getUserId());
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        expireCookie(request, response, "JSESSIONID");
        SecurityContextHolder.clearContext();
    }

    public void sendEmailVerificationCode(String email) {
        sendEmailVerificationCode(email, false);
    }

    public void sendSignupEmailVerificationCode(String email) {
        sendEmailVerificationCode(email, true);
    }

    private void sendEmailVerificationCode(String email, boolean rejectExistingEmail) {
        validateEmailFormat(email);
        if (rejectExistingEmail) {
            validateDuplicateEmail(email);
        }
        // TTL 안에 재발송 제한 기능
        validateCooldown(email);

        // 6자리 인증코드 생성
        String code = createVerificationCode();
        // 인증번호를 원문 그대로 저장 x -> 해시로 바꿔 저장하도록
        String codeHash = hashCode(code);
        String subject = "[NOVA] 이메일 인증번호 안내";
        String text = "인증번호는 " + code + " 입니다. 5분 내에 입력해주세요.";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject(subject);
            message.setText(text);
            javaMailSender.send(message);
        } catch (MailException e) {
            log.warn("이메일 인증번호 발송 실패. email={}", maskEmail(email), e);
            throw new CustomException(EMAIL_VERIFICATION_SEND_FAILED);
        }

        // 사용자가 입력한 인증번호를 같은 방식으로 해시해서 비교하기 위해 redis에 저장
        stringRedisTemplate.opsForValue().set(formatCodeKey(email), codeHash, EMAIL_CODE_TTL);
        // 60초 내 재요청을 막기 위해 redis에 저장
        stringRedisTemplate.opsForValue().set(formatCooldownKey(email), "1", EMAIL_RESEND_COOLDOWN);
    }

    public void confirmEmailVerificationCode(String email, String code) {
        validateEmailFormat(email);

        String savedCodeHash = stringRedisTemplate.opsForValue().get(formatCodeKey(email));
        if (savedCodeHash == null) {
            // savedCodeHash가 null 이라면, 인증시간이 만료가 돼서 예외처리
            throw new CustomException(EMAIL_VERIFICATION_CODE_EXPIRED_OR_NOT_FOUND);
        }

        // 해시를 복호화가 불가능하기 때문에, 사용자가 입력한 code를 동일한 방식으로 hash해서 일치여부 판단
        String inputCodeHash = hashCode(code);
        if (!savedCodeHash.equals(inputCodeHash)) {
            throw new CustomException(EMAIL_VERIFICATION_CODE_NOT_MATCHED);
        }

        // 인증이 성공하면, 해당 이메에 대해서 같은 코드 재사용 방지를 위해 redis에서 제거
        stringRedisTemplate.delete(formatCodeKey(email));
    }

    private void validatePassword(String password) {
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
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

    private void validateEmailFormat(String email) {
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new CustomException(INVALID_EMAIL_FORMAT);
        }
    }

    private void validateCooldown(String email) {
        // redis에 해당 이메일 키 값을 가져오는 메서드
        String cooldown = stringRedisTemplate.opsForValue().get(formatCooldownKey(email));
        if (cooldown != null) {
            // redis에 이메일에 대한 정보가 있다면, TTL 만료시간이 지나지 않았기 때문에 재발송 방지
            throw new CustomException(EMAIL_VERIFICATION_RESEND_TOO_EARLY);
        }
    }

    private String formatCooldownKey(String email) {
        return String.format(EMAIL_VERIFICATION_COOLDOWN_KEY, email);
    }

    private void expireCookie(HttpServletRequest request, HttpServletResponse response, String cookieName) {
        Cookie cookie = new Cookie(cookieName, null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(request.isSecure());
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String createVerificationCode() {
        int number = SECURE_RANDOM.nextInt((int) Math.pow(10, EMAIL_CODE_LENGTH));
        // 생성된 코드가 6자리 아래라면 앞을 0으로 채움
        return String.format("%0" + EMAIL_CODE_LENGTH + "d", number);
    }

    private String hashCode(String rawCode) {
        try {
            // SHA-256 해시 알고리즘 사용
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            // 해시 대상 문자열은 코드 단독으로 하지 않음
            byte[] bytes = messageDigest.digest((rawCode + HASH_SALT).getBytes(StandardCharsets.UTF_8));
            // 해시 바이트 배열을 저장/비교하기 쉬운 16진수 문자열로 변환
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 알고리즘을 못 찾는 경우 (극히 드문 예외 케이스)
            throw new CustomException(EMAIL_VERIFICATION_SEND_FAILED);
        }
    }

    private String formatCodeKey(String email) {
        return String.format(EMAIL_VERIFICATION_CODE_KEY, email);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) {
            return "***" + email.substring(Math.max(0, atIndex));
        }
        return email.substring(0, 2) + "***" + email.substring(atIndex);
    }
}
