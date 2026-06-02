package woorifisa.project.backend.domain.job.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import woorifisa.project.backend.domain.job.entity.Application;
import woorifisa.project.backend.domain.job.entity.enums.ApplicationStatus;

public record CreateApplicationResponse(
	@JsonProperty("application_id")
	Long applicationId,
	ApplicationStatus status
) {

	public static CreateApplicationResponse from(Application application) {
		return new CreateApplicationResponse(application.getApplicationId(), application.getStatus());
	}
}
