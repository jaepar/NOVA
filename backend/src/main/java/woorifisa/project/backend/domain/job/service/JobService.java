package woorifisa.project.backend.domain.job.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningResponse;
import woorifisa.project.backend.domain.job.repository.JobRepository;
import woorifisa.project.backend.global.exception.CustomException;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.JOB_NOT_FOUND;

@Service
@Slf4j
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    @Transactional(readOnly = true)
    public JobOpeningListResponse getJobOpeningList(Pageable pageable) {
        return JobOpeningListResponse.from(jobRepository.findAllBy(pageable));
    }

    @Transactional(readOnly = true)
    public JobOpeningResponse getJobOpeningDetail(Long jobId) {
        return jobRepository.findById(jobId)
                .map(JobOpeningResponse::from)
                .orElseThrow(() -> {
                    log.warn("Job opening detail lookup failed. reason=not_found jobId={}", jobId);
                    return new CustomException(JOB_NOT_FOUND);
                });
    }
}
