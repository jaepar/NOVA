package woorifisa.project.gateway.domain.foreigner.dto;

import woorifisa.project.gateway.domain.foreigner.entity.Foreigner;

public record GovernmentIdentityResponse(
	String name,
	String issueDate,
	Boolean active
) {

	public static GovernmentIdentityResponse from(Foreigner foreigner) {
		return new GovernmentIdentityResponse(
			foreigner.getName(),
			foreigner.getIssueDate(),
			foreigner.getActive()
		);
	}
}
