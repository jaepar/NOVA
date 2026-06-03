package woorifisa.project.backend.domain.job.dto.response;

import java.util.List;

public record ApplicationListResponse(
	List<ApplicationItem> items
) {
}
