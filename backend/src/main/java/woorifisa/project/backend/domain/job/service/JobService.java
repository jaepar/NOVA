package woorifisa.project.backend.domain.job.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.APPLICATION_ALREADY_EXISTS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.JOB_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import woorifisa.project.backend.domain.job.dto.response.CreateApplicationResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningResponse;
import woorifisa.project.backend.domain.job.entity.Application;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.job.entity.enums.ApplicationStatus;
import woorifisa.project.backend.domain.job.repository.ApplicationRepository;
import woorifisa.project.backend.domain.job.repository.JobRepository;
import woorifisa.project.backend.domain.user.entity.Resume;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.repository.ResumeRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.domain.user.service.PortfolioFileS3Uploader;
import woorifisa.project.backend.global.exception.CustomException;

@Service
@Slf4j
@RequiredArgsConstructor
public class JobService {

	private final JobRepository jobRepository;
	private final ApplicationRepository applicationRepository;
	private final UserRepository userRepository;
	private final ResumeRepository resumeRepository;
	private final PortfolioFileS3Uploader portfolioFileS3Uploader;

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

	@Transactional
	public CreateApplicationResponse createApplication(
		Long userId,
		Long jobId,
		String countryCode,
		String phone,
		String recommender,
		MultipartFile[] files
	) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));
		Job job = jobRepository.findById(jobId)
			.orElseThrow(() -> {
				log.warn("job application submit failed. reason=job_not_found userId={}, jobId={}", userId, jobId);
				return new CustomException(JOB_NOT_FOUND);
			});

		if (applicationRepository.existsByUserAndJob(user, job)) {
			log.warn("job application submit failed. reason=duplicate userId={}, jobId={}", userId, jobId);
			throw new CustomException(APPLICATION_ALREADY_EXISTS);
		}

		Application application = applicationRepository.save(Application.builder()
			.user(user)
			.job(job)
			.countryCode(blankToNull(countryCode))
			.phone(blankToNull(phone))
			.recommender(blankToNull(recommender))
			.status(ApplicationStatus.UNREAD)
			.build());

		saveFiles(user, application, files);
		return CreateApplicationResponse.from(application);
	}

	private void saveFiles(User user, Application application, MultipartFile[] files) {
		if (files == null || files.length == 0) {
			return;
		}

		for (int i = 0; i < files.length; i++) {
			MultipartFile file = files[i];
			if (file == null || file.isEmpty()) {
				continue;
			}

			String fileUrl = portfolioFileS3Uploader.upload(
				user.getUserId(),
				application.getApplicationId(),
				i,
				file
			);
			resumeRepository.save(Resume.builder()
				.user(user)
				.application(application)
				.name(resolveFilename(file))
				.url(fileUrl)
				.build());
		}
	}

	private String resolveFilename(MultipartFile file) {
		return file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()
			? "attachment"
			: file.getOriginalFilename();
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value;
	}
}
