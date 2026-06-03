package woorifisa.project.backend.domain.job.dto.response;

import woorifisa.project.backend.domain.user.entity.Resume;

public record PortfolioFileItem(
	String name,
	String url
) {

	public static PortfolioFileItem from(Resume resume) {
		if (resume == null) {
			return null;
		}
		return new PortfolioFileItem(resume.getName(), resume.getUrl());
	}
}
