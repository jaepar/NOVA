package woorifisa.project.backend.global.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.ApplicationRunner;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.session.FlushMode;
import org.springframework.session.SaveMode;
import org.springframework.session.config.SessionRepositoryCustomizer;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.CookieSerializer.CookieValue;

class RedisSessionConfigTest {

    private final RedisSessionConfig redisSessionConfig = new RedisSessionConfig();

    @Test
    @DisplayName("Spring Session 쿠키명을 JSESSIONID로 발급한다")
    void cookieSerializerWritesJsessionIdCookie() {
        CookieSerializer cookieSerializer = redisSessionConfig.cookieSerializer();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        cookieSerializer.writeCookieValue(new CookieValue(request, response, "session-id"));

        List<String> setCookieHeaders = response.getHeaders("Set-Cookie");
        assertThat(setCookieHeaders).anySatisfy(header ->
                assertThat(header).startsWith("JSESSIONID="));
        assertThat(setCookieHeaders).noneSatisfy(header ->
                assertThat(header).startsWith("SESSION="));
    }

    @Test
    @DisplayName("Redis Session 설정 클래스에는 운영에 불필요한 진단/중복 설정 Bean을 두지 않는다")
    void redisSessionConfigDoesNotExposeDiagnosticOrDuplicateBeans() {
        assertThat(Stream.of(RedisSessionConfig.class.getDeclaredMethods())
                .filter(method -> method.getReturnType().equals(ApplicationRunner.class)
                        || method.getReturnType().equals(SessionRepositoryCustomizer.class)))
                .isEmpty();
    }

    @Test
    @DisplayName("Redis Session은 변경된 세션만 요청 종료 시 저장하도록 설정한다")
    void redisSessionConfigDefersWritesUntilRequestCommitAndChangedAttributes() {
        EnableRedisHttpSession annotation = RedisSessionConfig.class.getAnnotation(EnableRedisHttpSession.class);

        assertThat(annotation.flushMode()).isEqualTo(FlushMode.ON_SAVE);
        assertThat(annotation.saveMode()).isEqualTo(SaveMode.ON_SET_ATTRIBUTE);
    }
}
