package woorifisa.project.backend.domain.auth.session.resolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import woorifisa.project.backend.domain.auth.session.annotation.LoginUser;
import woorifisa.project.backend.domain.auth.session.service.SessionAuthService;

@Component
@RequiredArgsConstructor
public class LoginUserIdArgumentResolver implements HandlerMethodArgumentResolver {

    private final SessionAuthService sessionAuthService;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(LoginUser.class)
                && Long.class.equals(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        HttpSession session = (request == null) ? null : request.getSession(false);
        return sessionAuthService.requireUserId(session);
    }
}
