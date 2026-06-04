package woorifisa.project.backend.domain.job.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import woorifisa.project.backend.domain.user.entity.User;

public record ApplicationFormResponse(
	@JsonProperty("user_id")
	Long userId,
	String name,
	String email,
	List<ApplicationFormPortfolioResponse> portfolios
) {

	public static ApplicationFormResponse from(User user, List<ApplicationFormPortfolioResponse> portfolios) {
		return new ApplicationFormResponse(
			user.getUserId(),
			user.getName(),
			user.getEmail(),
			portfolios
		);
	}
}
