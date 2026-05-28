package woorifisa.project.backend.domain.job.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import woorifisa.project.backend.domain.job.entity.Job;

import java.time.LocalDateTime;

public record JobOpeningItem(
        @JsonProperty("job_id")
        Long jobId,
        String company,
        String region,
        @JsonProperty("opening_title")
        String openingTitle,
        @JsonProperty("job_category")
        String jobCategory,
        String experience,
        @JsonProperty("employment_type")
        String employmentType,
        String salary,
        @JsonProperty("deadline_type")
        String deadlineType,
        @JsonProperty("created_at")
        LocalDateTime createdAt
) {

    public static JobOpeningItem from(Job job) {
        return new JobOpeningItem(
                job.getJobId(),
                job.getCompany(),
                job.getRegion(),
                job.getOpeningTitle(),
                job.getJobCategory(),
                job.getExperience(),
                job.getEmploymentType(),
                job.getSalary(),
                job.getDeadlineType(),
                job.getCreatedAt()
        );
    }
}
