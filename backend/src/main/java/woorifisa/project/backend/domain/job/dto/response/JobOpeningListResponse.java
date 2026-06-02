package woorifisa.project.backend.domain.job.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.Slice;
import woorifisa.project.backend.domain.job.entity.Job;

import java.util.List;

public record JobOpeningListResponse(
        List<JobOpeningItem> items,
        int page,
        int size,
        @JsonProperty("has_next")
        boolean hasNext
) {

    public static JobOpeningListResponse from(Slice<Job> jobs) {
        return new JobOpeningListResponse(
                jobs.getContent().stream()
                        .map(JobOpeningItem::from)
                        .toList(),
                jobs.getNumber(),
                jobs.getSize(),
                jobs.hasNext()
        );
    }
}
