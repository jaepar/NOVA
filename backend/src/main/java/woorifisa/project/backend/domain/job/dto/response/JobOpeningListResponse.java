package woorifisa.project.backend.domain.job.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.Slice;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.job.entity.JobTranslation;

import java.util.List;
import java.util.Map;

public record JobOpeningListResponse(
        List<JobOpeningItem> items,
        int page,
        int size,
        @JsonProperty("has_next")
        boolean hasNext
) {

    public static JobOpeningListResponse from(Slice<Job> jobs) {
        return from(jobs, Map.of());
    }

    public static JobOpeningListResponse from(Slice<Job> jobs, Map<Long, JobTranslation> translationsByJobId) {
        return new JobOpeningListResponse(
                jobs.getContent().stream()
                        .map(job -> JobOpeningItem.from(job, translationsByJobId.get(job.getJobId())))
                        .toList(),
                jobs.getNumber(),
                jobs.getSize(),
                jobs.hasNext()
        );
    }
}
