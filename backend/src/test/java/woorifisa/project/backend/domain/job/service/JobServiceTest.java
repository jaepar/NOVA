package woorifisa.project.backend.domain.job.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.job.repository.JobRepository;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    @Test
    @DisplayName("DB의 구인구직 공고를 최신순 페이지네이션으로 조회한다")
    void findJobOpenings() {
        Job job = job(1L, "ABC Company", "SEOUL", "백엔드 개발자 모집", LocalDateTime.of(2026, 5, 13, 12, 30));
        when(jobRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(job), Pageable.ofSize(10), 25));

        JobOpeningListResponse response = jobService.findJobOpenings(0, 10);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        org.mockito.Mockito.verify(jobRepository).findAll(pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();

        assertThat(pageable.getPageNumber()).isEqualTo(0);
        assertThat(pageable.getPageSize()).isEqualTo(10);
        assertThat(pageable.getSort().getOrderFor("createdAt")).isNotNull();
        assertThat(pageable.getSort().getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.DESC);
        assertThat(response.totalCount()).isEqualTo(25);
        assertThat(response.totalPages()).isEqualTo(3);
        assertThat(response.page()).isEqualTo(0);
        assertThat(response.size()).isEqualTo(10);
        assertThat(response.jobOpenings()).hasSize(1);
        assertThat(response.jobOpenings().get(0).jobId()).isEqualTo(1L);
        assertThat(response.jobOpenings().get(0).createdAt()).isEqualTo(LocalDateTime.of(2026, 5, 13, 12, 30));
    }

    @Test
    @DisplayName("공고가 없으면 빈 목록과 0건 페이지 정보를 반환한다")
    void findJobOpeningsEmpty() {
        when(jobRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), Pageable.ofSize(10), 0));

        JobOpeningListResponse response = jobService.findJobOpenings(0, 10);

        assertThat(response.totalCount()).isZero();
        assertThat(response.totalPages()).isZero();
        assertThat(response.jobOpenings()).isEmpty();
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
                .salary("회사 내규에 따름")
                .deadlineType("UNTIL_FILLED")
                .build();
        ReflectionTestUtils.setField(job, "createdAt", createdAt);
        return job;
    }
}
