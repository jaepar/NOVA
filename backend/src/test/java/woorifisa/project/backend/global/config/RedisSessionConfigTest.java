package woorifisa.project.backend.global.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.ApplicationRunner;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.session.config.SessionRepositoryCustomizer;
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
}
