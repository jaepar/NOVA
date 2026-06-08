package woorifisa.project.backend.domain.user.dto.response;

import java.util.List;

import woorifisa.project.backend.domain.user.entity.Resume;
import woorifisa.project.backend.domain.user.entity.User;

public record UserProfileResponse(
	String name,
	String email,
	String birth,
	String gender,
	Boolean hasResidenceCard,
	String certificateStatus,
	List<PortfolioResponse> portfolios
) {

	public static UserProfileResponse from(User user, List<Resume> resumes) {
		return new UserProfileResponse(
			user.getName(),
			user.getEmail(),
			user.getBirth(),
			user.getGender().name(),
			user.getHasResidenceCard(),
			user.getCertificateStatus().name(),
			resumes.stream()
				.map(PortfolioResponse::from)
				.toList()
		);
	}

	public record PortfolioResponse(
		Long portfolioId,
		String name,
		String url
	) {

		public static PortfolioResponse from(Resume resume) {
			return new PortfolioResponse(
				resume.getResumeId(),
				resume.getName(),
				resume.getUrl()
			);
		}
	}
}
