package woorifisa.project.backend.domain.auth.session.service;

import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SessionAuthServiceTest {

    private final SessionAuthService sessionAuthService = new SessionAuthService();

    @Test
    @DisplayName("유효한 세션에서 userId를 반환한다")
    void requireUserIdReturnsUserId() {
        HttpSession session = mock(HttpSession.class);
        when(session.getAttribute("userId")).thenReturn(1L);

        Long userId = sessionAuthService.requireUserId(session);

        assertThat(userId).isEqualTo(1L);
    }

    @Test
    @DisplayName("세션이 없으면 예외가 발생한다")
    void requireUserIdThrowsWhenSessionIsNull() {
        assertThatThrownBy(() -> sessionAuthService.requireUserId(null))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BaseExceptionResponseStatus.UNAUTHORIZED_SESSION);
    }

    @Test
    @DisplayName("세션에 userId가 없으면 예외가 발생한다")
    void requireUserIdThrowsWhenUserIdIsMissing() {
        HttpSession session = mock(HttpSession.class);
        when(session.getAttribute("userId")).thenReturn(null);

        assertThatThrownBy(() -> sessionAuthService.requireUserId(session))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(BaseExceptionResponseStatus.UNAUTHORIZED_SESSION);
    }
}
