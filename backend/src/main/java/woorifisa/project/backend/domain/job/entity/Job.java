package woorifisa.project.backend.domain.job.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import woorifisa.project.backend.global.entity.BaseEntity;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "job")
public class Job extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "company", length = 100, nullable = false)
    private String company;

    @Column(name = "region", length = 100, nullable = false)
    private String region;

    @Column(name = "opening_title", length = 100, nullable = false)
    private String openingTitle;

    @Column(name = "job_category", length = 50)
    private String jobCategory;

    @Column(name = "experience", length = 50)
    private String experience;

    @Column(name = "salary", length = 50)
    private String salary;

    @Column(name = "deadline_type", length = 50)
    private String deadlineType;

    @Column(name = "recruit_count", length = 50)
    private String recruitCount;

    @Column(name = "preferred", length = 100)
    private String preferred;

    @Column(name = "age", length = 50)
    private String age;

    @Column(name = "gender", length = 50)
    private String gender;

    @Column(name = "job_role", length = 50)
    private String jobRole;

    @Column(name = "work_period", length = 50)
    private String workPeriod;

    @Column(name = "employment_type", length = 50)
    private String employmentType;

    @Column(name = "benefits", length = 100)
    private String benefits;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "introduce", columnDefinition = "TEXT")
    private String introduce;
}
