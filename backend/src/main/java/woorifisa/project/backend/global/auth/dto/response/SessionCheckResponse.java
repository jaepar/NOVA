package woorifisa.project.backend.global.auth.dto.response;

public record SessionCheckResponse(
        Long userId
) {

    public static SessionCheckResponse from(Long userId) {
        return new SessionCheckResponse(userId);
    }
}
