package woorifisa.project.backend.domain.job.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import woorifisa.project.backend.domain.user.entity.Resume;

public record ApplicationFormPortfolioResponse(
	@JsonProperty("portfolio_id")
	Long portfolioId,
	String name,
	String url
) {

	public static ApplicationFormPortfolioResponse from(Resume resume) {
		return new ApplicationFormPortfolioResponse(
			resume.getResumeId(),
			resume.getName(),
			resume.getUrl()
		);
	}
}
