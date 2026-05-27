package woorifisa.project.backend.global.auth.dto.response;

public record LoginResponse(
        Long userId
) {

    public static LoginResponse from(Long userId) {
        return new LoginResponse(userId);
    }
}
