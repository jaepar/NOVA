package woorifisa.project.backend.domain.user.dto.request;

public record UpdateUserRequest(
	String language,
	String currentPassword,
	String newPassword,
	String newPasswordConfirm,
	Long deletePortfolioId
) {
}
