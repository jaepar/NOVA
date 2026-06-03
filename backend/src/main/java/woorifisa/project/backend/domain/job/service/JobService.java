package woorifisa.project.backend.domain.job.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.APPLICATION_ALREADY_EXISTS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.JOB_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import woorifisa.project.backend.domain.job.dto.response.ApplicationFormResponse;
import woorifisa.project.backend.domain.job.dto.response.ApplicationFormPortfolioResponse;
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

	// 지원서 작성 화면에 필요한 사용자 기본 정보와 프로필 포트폴리오를 조회한다.
	@Transactional(readOnly = true)
	public ApplicationFormResponse getApplicationForm(Long userId, Long jobId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));
		jobRepository.findById(jobId)
			.orElseThrow(() -> {
				log.warn("job application form lookup failed. reason=job_not_found userId={}, jobId={}", userId, jobId);
				return new CustomException(JOB_NOT_FOUND);
			});

		// application_id가 없는 resume은 특정 지원서가 아닌 이미 프로필 페이지에서 개별적으로 등록된 포트폴리오다. (공통 포트폴리오)
		List<ApplicationFormPortfolioResponse> portfolios = resumeRepository
			.findByUserAndApplicationIsNullOrderByResumeIdDesc(user)
			.stream()
			.map(ApplicationFormPortfolioResponse::from)
			.toList();

		return ApplicationFormResponse.from(user, portfolios);
	}

	// 지원서는 로그인 사용자와 공고만으로 생성하고, 선택 첨부파일은 생성된 지원서에 연결한다.
	@Transactional
	public void createApplication(
		Long userId,
		Long jobId,
		MultipartFile[] files
	) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));
		Job job = jobRepository.findById(jobId)
			.orElseThrow(() -> {
				log.warn("job application submit failed. reason=job_not_found userId={}, jobId={}", userId, jobId);
				return new CustomException(JOB_NOT_FOUND);
			});

		// 사용자가 동일한 구인공고에 중복 지원하는 경우를 막는다.
		if (applicationRepository.existsByUserAndJob(user, job)) {
			log.warn("job application submit failed. reason=duplicate userId={}, jobId={}", userId, jobId);
			throw new CustomException(APPLICATION_ALREADY_EXISTS);
		}

		// 지원내역 저장
		Application application = applicationRepository.save(Application.builder()
			.user(user)
			.job(job)
			.status(ApplicationStatus.UNREAD)
			.build());

		saveFiles(user, application, files);
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

			// 파일명 저장 형식
			// portfolios/user-{userId}/application-{applicationId}/portfolio-{fileIndex}_{filename}
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
}
