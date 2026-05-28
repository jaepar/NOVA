package woorifisa.project.backend.domain.job.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.repository.JobRepository;

@Service
@RequiredArgsConstructor
public class JobService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;

    private final JobRepository jobRepository;

    public JobOpeningListResponse findJobOpenings(int page, int size) {
        int normalizedPage = Math.max(page, DEFAULT_PAGE);
        int normalizedSize = size <= 0 ? DEFAULT_SIZE : size;

        return JobOpeningListResponse.from(jobRepository.findAll(
                PageRequest.of(
                        normalizedPage,
                        normalizedSize,
                        Sort.by(Sort.Direction.DESC, "createdAt")
                )
        ));
    }
}
