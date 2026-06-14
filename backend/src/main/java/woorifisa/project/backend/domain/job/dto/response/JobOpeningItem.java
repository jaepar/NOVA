package woorifisa.project.backend.domain.job.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.job.entity.JobTranslation;

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
        @JsonProperty("work_period")
        String workPeriod,
        String salary,
        @JsonProperty("created_at")
        LocalDateTime createdAt
) {

    public static JobOpeningItem from(Job job) {
        return from(job, null);
    }

    public static JobOpeningItem from(Job job, JobTranslation translation) {
        return new JobOpeningItem(
                job.getJobId(),
                translated(translation == null ? null : translation.getCompany(), job.getCompany()),
                translated(translation == null ? null : translation.getRegion(), job.getRegion()),
                translated(translation == null ? null : translation.getOpeningTitle(), job.getOpeningTitle()),
                translated(translation == null ? null : translation.getJobCategory(), job.getJobCategory()),
                translated(translation == null ? null : translation.getExperience(), job.getExperience()),
                translated(translation == null ? null : translation.getWorkPeriod(), job.getWorkPeriod()),
                translated(translation == null ? null : translation.getSalary(), job.getSalary()),
                job.getCreatedAt()
        );
    }

    private static String translated(String translatedValue, String fallbackValue) {
        return translatedValue == null || translatedValue.isBlank() ? fallbackValue : translatedValue;
    }
}
