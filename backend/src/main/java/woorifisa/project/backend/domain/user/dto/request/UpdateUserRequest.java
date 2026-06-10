package woorifisa.project.backend.domain.user.dto.request;

import jakarta.validation.constraints.Pattern;

public record UpdateUserRequest(
	String language,
	String currentPassword,

	@Pattern(
		regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,16}$",
		message = "비밀번호는 영문, 숫자, 특수문자 포함 8~16자여야 합니다"
	)
	String newPassword,

	String newPasswordConfirm,
	Long deletePortfolioId
) {
}
