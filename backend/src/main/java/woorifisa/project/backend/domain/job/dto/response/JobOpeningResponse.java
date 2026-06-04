package woorifisa.project.backend.domain.job.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import woorifisa.project.backend.domain.job.entity.Job;

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
        return new JobOpeningResponse(
                job.getJobId(),
                job.getCompany(),
                job.getRegion(),
                job.getOpeningTitle(),
                job.getJobCategory(),
                job.getExperience(),
                job.getSalary(),
                job.getDeadlineType(),
                job.getRecruitCount(),
                job.getPreferred(),
                job.getAge(),
                job.getGender(),
                job.getJobRole(),
                job.getWorkPeriod(),
                job.getEmploymentType(),
                job.getBenefits(),
                job.getAddress(),
                job.getIntroduce()
        );
    }
}
