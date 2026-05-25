package woorifisa.project.backend.domain.auth.session.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import woorifisa.project.backend.domain.auth.session.service.SessionAuthService;

@Component
@RequiredArgsConstructor
public class SessionAuthInterceptor implements HandlerInterceptor {

    private final SessionAuthService sessionAuthService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        HttpSession session = request.getSession(false);
        sessionAuthService.requireUserId(session);
        return true;
    }
}
