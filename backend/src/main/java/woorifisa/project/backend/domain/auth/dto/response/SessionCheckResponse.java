package woorifisa.project.backend.domain.auth.dto.response;

public record SessionCheckResponse(
        boolean isLoggedIn,
        Long userId
) {

    public static SessionCheckResponse loggedIn(Long userId) {
        return new SessionCheckResponse(true, userId);
    }

    public static SessionCheckResponse loggedOut() {
        return new SessionCheckResponse(false, null);
    }
}
