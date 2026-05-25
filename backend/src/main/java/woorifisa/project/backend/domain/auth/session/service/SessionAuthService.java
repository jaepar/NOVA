package woorifisa.project.backend.domain.auth.session.service;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import woorifisa.project.backend.global.exception.CustomException;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.UNAUTHORIZED_SESSION;

@Service
public class SessionAuthService {

    public Long requireUserId(HttpSession session) {
        if (session == null) {
            throw new CustomException(UNAUTHORIZED_SESSION);
        }

        Object userIdAttribute = session.getAttribute("userId");
        if (!(userIdAttribute instanceof Long userId)) {
            throw new CustomException(UNAUTHORIZED_SESSION);
        }

        return userId;
    }
}
