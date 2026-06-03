package woorifisa.project.backend.global.government.client.response;

public record GovermentIdentityResponse(
	String name,
	String issueDate,
	Boolean active
) {
}
