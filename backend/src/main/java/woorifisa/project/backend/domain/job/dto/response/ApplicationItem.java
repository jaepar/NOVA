package woorifisa.project.backend.domain.job.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import woorifisa.project.backend.domain.job.entity.Application;
import woorifisa.project.backend.domain.job.entity.JobTranslation;
import woorifisa.project.backend.domain.job.entity.enums.ApplicationStatus;

public record ApplicationItem(
	@JsonProperty("application_id")
	Long applicationId,
	@JsonProperty("job_id")
	Long jobId,
	@JsonProperty("opening_title")
	String openingTitle,
	@JsonProperty("applied_at")
	LocalDateTime appliedAt,
	ApplicationStatus status
) {

	public static ApplicationItem from(Application application) {
		return from(application, null);
	}

	public static ApplicationItem from(Application application, JobTranslation translation) {
		return new ApplicationItem(
			application.getApplicationId(),
			application.getJob().getJobId(),
			translated(translation == null ? null : translation.getOpeningTitle(), application.getJob().getOpeningTitle()),
			application.getCreatedAt(),
			application.getStatus()
		);
	}

	private static String translated(String translatedValue, String fallbackValue) {
		return translatedValue == null || translatedValue.isBlank() ? fallbackValue : translatedValue;
	}
}
