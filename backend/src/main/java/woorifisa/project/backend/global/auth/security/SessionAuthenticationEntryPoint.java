package woorifisa.project.backend.global.auth.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import woorifisa.project.backend.global.response.BaseErrorResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.UNAUTHORIZED_SESSION;

@Component
public class SessionAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        BaseErrorResponse errorResponse = new BaseErrorResponse(UNAUTHORIZED_SESSION);
        String body = String.format(
                "{\"success\":%s,\"code\":\"%s\",\"message\":\"%s\",\"data\":null}",
                errorResponse.getSuccess(),
                errorResponse.getCode(),
                errorResponse.getMessage()
        );
        response.getWriter().write(body);
    }
}
