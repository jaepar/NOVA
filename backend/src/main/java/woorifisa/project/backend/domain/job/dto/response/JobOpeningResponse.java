package woorifisa.project.backend.domain.job.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.job.entity.JobTranslation;

public record JobOpeningResponse(
        @JsonProperty("job_id")
        Long jobId,
        String company,
        String region,
        @JsonProperty("opening_title")
        String openingTitle,
        @JsonProperty("job_category")
        String jobCategory,
        String experience,
        String salary,
        @JsonProperty("deadline_type")
        String deadlineType,
        @JsonProperty("recruit_count")
        String recruitCount,
        String preferred,
        String age,
        String gender,
        @JsonProperty("job_role")
        String jobRole,
        @JsonProperty("work_period")
        String workPeriod,
        @JsonProperty("employment_type")
        String employmentType,
        String benefits,
        String address,
        String introduce
) {

    public static JobOpeningResponse from(Job job) {
        return from(job, null);
    }

    public static JobOpeningResponse from(Job job, JobTranslation translation) {
        return new JobOpeningResponse(
                job.getJobId(),
                translated(translation == null ? null : translation.getCompany(), job.getCompany()),
                translated(translation == null ? null : translation.getRegion(), job.getRegion()),
                translated(translation == null ? null : translation.getOpeningTitle(), job.getOpeningTitle()),
                translated(translation == null ? null : translation.getJobCategory(), job.getJobCategory()),
                translated(translation == null ? null : translation.getExperience(), job.getExperience()),
                translated(translation == null ? null : translation.getSalary(), job.getSalary()),
                translated(translation == null ? null : translation.getDeadlineType(), job.getDeadlineType()),
                translated(translation == null ? null : translation.getRecruitCount(), job.getRecruitCount()),
                translated(translation == null ? null : translation.getPreferred(), job.getPreferred()),
                translated(translation == null ? null : translation.getAge(), job.getAge()),
                translated(translation == null ? null : translation.getGender(), job.getGender()),
                translated(translation == null ? null : translation.getJobRole(), job.getJobRole()),
                translated(translation == null ? null : translation.getWorkPeriod(), job.getWorkPeriod()),
                translated(translation == null ? null : translation.getEmploymentType(), job.getEmploymentType()),
                translated(translation == null ? null : translation.getBenefits(), job.getBenefits()),
                translated(translation == null ? null : translation.getAddress(), job.getAddress()),
                translated(translation == null ? null : translation.getIntroduce(), job.getIntroduce())
        );
    }

    private static String translated(String translatedValue, String fallbackValue) {
        return translatedValue == null || translatedValue.isBlank() ? fallbackValue : translatedValue;
    }
}
