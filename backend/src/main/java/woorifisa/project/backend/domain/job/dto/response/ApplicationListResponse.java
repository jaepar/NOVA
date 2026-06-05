package woorifisa.project.backend.domain.job.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.Slice;
import woorifisa.project.backend.domain.job.entity.Application;

public record ApplicationListResponse(
	List<ApplicationItem> items,
	int page,
	int size,
	@JsonProperty("has_next")
	boolean hasNext
) {

	public static ApplicationListResponse from(Slice<Application> applications) {
		return new ApplicationListResponse(
			applications.getContent().stream()
				.map(ApplicationItem::from)
				.toList(),
			applications.getNumber(),
			applications.getSize(),
			applications.hasNext()
		);
	}
}
