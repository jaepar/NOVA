package woorifisa.project.backend.domain.job.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.SliceImpl;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningResponse;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.job.repository.JobRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.JOB_NOT_FOUND;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    @Test
    @DisplayName("get job opening list with slice pagination")
    void getJobOpeningList() {
        Job job = job(1L, "ABC Company", "SEOUL", "Backend Developer", LocalDateTime.of(2026, 5, 13, 12, 30));
        Pageable requestedPageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(jobRepository.findAllBy(any(Pageable.class)))
                .thenReturn(new SliceImpl<>(List.of(job), requestedPageable, true));

        JobOpeningListResponse response = jobService.getJobOpeningList(requestedPageable);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(jobRepository).findAllBy(pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();

        assertThat(pageable.getPageNumber()).isEqualTo(0);
        assertThat(pageable.getPageSize()).isEqualTo(10);
        assertThat(pageable.getSort().getOrderFor("createdAt")).isNotNull();
        assertThat(pageable.getSort().getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.DESC);
        assertThat(response.page()).isEqualTo(0);
        assertThat(response.size()).isEqualTo(10);
        assertThat(response.hasNext()).isTrue();
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).jobId()).isEqualTo(1L);
        assertThat(response.items().get(0).workPeriod()).isEqualTo("5 days a week");
        assertThat(response.items().get(0).createdAt()).isEqualTo(LocalDateTime.of(2026, 5, 13, 12, 30));
    }

    @Test
    @DisplayName("return empty slice when there are no job openings")
    void getJobOpeningListEmpty() {
        Pageable requestedPageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(jobRepository.findAllBy(any(Pageable.class)))
                .thenReturn(new SliceImpl<>(List.of(), requestedPageable, false));

        JobOpeningListResponse response = jobService.getJobOpeningList(requestedPageable);

        assertThat(response.items()).isEmpty();
        assertThat(response.page()).isZero();
        assertThat(response.size()).isEqualTo(10);
        assertThat(response.hasNext()).isFalse();
    }

    @Test
    @DisplayName("find job opening detail by job ID")
    void getJobOpeningDetail() {
        Job job = Job.builder()
                .jobId(1L)
                .company("ABC Company")
                .region("SEOUL")
                .openingTitle("Backend Developer")
                .jobCategory("IT")
                .experience("ENTRY")
                .salary("Annual 35M KRW or more")
                .deadlineType("UNTIL_FILLED")
                .recruitCount("2")
                .preferred("Java/Spring experience")
                .age("Any")
                .gender("Any")
                .jobRole("Backend development")
                .workPeriod("1 year or more")
                .employmentType("FULL_TIME")
                .benefits("Meal support, insurance")
                .address("Seoul Gangnam-gu")
                .introduce("Company introduction")
                .build();
        when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

        JobOpeningResponse response = jobService.getJobOpeningDetail(1L);

        assertThat(response.jobId()).isEqualTo(1L);
        assertThat(response.company()).isEqualTo("ABC Company");
        assertThat(response.region()).isEqualTo("SEOUL");
        assertThat(response.openingTitle()).isEqualTo("Backend Developer");
        assertThat(response.jobCategory()).isEqualTo("IT");
        assertThat(response.experience()).isEqualTo("ENTRY");
        assertThat(response.salary()).isEqualTo("Annual 35M KRW or more");
        assertThat(response.deadlineType()).isEqualTo("UNTIL_FILLED");
        assertThat(response.recruitCount()).isEqualTo("2");
        assertThat(response.preferred()).isEqualTo("Java/Spring experience");
        assertThat(response.age()).isEqualTo("Any");
        assertThat(response.gender()).isEqualTo("Any");
        assertThat(response.jobRole()).isEqualTo("Backend development");
        assertThat(response.workPeriod()).isEqualTo("1 year or more");
        assertThat(response.employmentType()).isEqualTo("FULL_TIME");
        assertThat(response.benefits()).isEqualTo("Meal support, insurance");
        assertThat(response.address()).isEqualTo("Seoul Gangnam-gu");
        assertThat(response.introduce()).isEqualTo("Company introduction");
    }

    @Test
    @DisplayName("throw JOB_NOT_FOUND when job opening does not exist")
    void getJobOpeningDetailNotFound() {
        when(jobRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.getJobOpeningDetail(999L))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(JOB_NOT_FOUND);
    }

    private Job job(Long jobId, String company, String region, String title, LocalDateTime createdAt) {
        Job job = Job.builder()
                .jobId(jobId)
                .company(company)
                .region(region)
                .openingTitle(title)
                .jobCategory("IT")
                .experience("ENTRY")
                .employmentType("FULL_TIME")
                .workPeriod("5 days a week")
                .salary("Company policy")
                .deadlineType("UNTIL_FILLED")
                .build();
        ReflectionTestUtils.setField(job, "createdAt", createdAt);
        return job;
    }
}
