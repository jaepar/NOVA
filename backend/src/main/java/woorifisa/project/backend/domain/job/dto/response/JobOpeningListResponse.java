package woorifisa.project.backend.domain.job.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.Page;
import woorifisa.project.backend.domain.job.entity.Job;

import java.util.List;

public record JobOpeningListResponse(
        @JsonProperty("total_count")
        long totalCount,
        @JsonProperty("total_pages")
        int totalPages,
        int page,
        int size,
        @JsonProperty("job_openings")
        List<JobOpeningItem> jobOpenings
) {

    public static JobOpeningListResponse from(Page<Job> jobs) {
        return new JobOpeningListResponse(
                jobs.getTotalElements(),
                jobs.getTotalPages(),
                jobs.getNumber(),
                jobs.getSize(),
                jobs.getContent().stream()
                        .map(JobOpeningItem::from)
                        .toList()
        );
    }
}
