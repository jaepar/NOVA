package woorifisa.project.backend.domain.job.dto.response;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.Slice;
import woorifisa.project.backend.domain.job.entity.Application;
import woorifisa.project.backend.domain.job.entity.JobTranslation;

public record ApplicationListResponse(
	List<ApplicationItem> items,
	int page,
	int size,
	@JsonProperty("has_next")
	boolean hasNext
) {

	public static ApplicationListResponse from(Slice<Application> applications) {
		return from(applications, Map.of());
	}

	public static ApplicationListResponse from(
		Slice<Application> applications,
		Map<Long, JobTranslation> translationsByJobId
	) {
		return new ApplicationListResponse(
			applications.getContent().stream()
				.map(application -> ApplicationItem.from(
					application,
					translationsByJobId.get(application.getJob().getJobId())
				))
				.toList(),
			applications.getNumber(),
			applications.getSize(),
			applications.hasNext()
		);
	}
}
