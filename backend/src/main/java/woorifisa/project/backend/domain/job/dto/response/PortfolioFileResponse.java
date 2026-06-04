package woorifisa.project.backend.domain.job.dto.response;

import woorifisa.project.backend.domain.user.entity.Resume;

public record PortfolioFileResponse(
	String name,
	String url
) {

	public static PortfolioFileResponse from(Resume resume) {
		if (resume == null) {
			return null;
		}
		return new PortfolioFileResponse(resume.getName(), resume.getUrl());
	}
}
