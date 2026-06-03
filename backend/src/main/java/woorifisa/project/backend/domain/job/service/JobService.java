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

import woorifisa.project.backend.domain.job.dto.response.ApplicationItem;
import woorifisa.project.backend.domain.job.dto.response.ApplicationFormResponse;
import woorifisa.project.backend.domain.job.dto.response.ApplicationFormPortfolioResponse;
import woorifisa.project.backend.domain.job.dto.response.ApplicationListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningResponse;
import woorifisa.project.backend.domain.job.dto.response.PortfolioFileItem;
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
	public ApplicationFormResponse getApplicationForm(Long userId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));

		List<ApplicationFormPortfolioResponse> portfolios = resumeRepository
			.findByUserOrderByResumeIdDesc(user)
			.stream()
			.map(ApplicationFormPortfolioResponse::from)
			.toList();

		return ApplicationFormResponse.from(user, portfolios);
	}

	// 지원서는 로그인 사용자와 공고로 생성하고, 선택 첨부파일은 대표 이력서로 연결한다.
	@Transactional
	public void createApplication(
		Long userId,
		Long jobId,
		MultipartFile[] files
	) {
		log.info("[job_application_submit:requested] userId={}, jobId={}, fileCount={}",
			userId, jobId, countAttachableFiles(files));

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

		if (files != null) {
			saveFiles(user, application, files);
		}

		log.info("[job_application_submit:completed] userId={}, jobId={}, applicationId={}, hasPortfolio={}",
			userId, jobId, application.getApplicationId(), application.getResume() != null);
	}

	// 지원 내역 전체 조회
	@Transactional(readOnly = true)
	public ApplicationListResponse findApplications(Long userId) {
		log.info("[job_applications_list:requested] userId={}", userId);

		List<Application> applications = applicationRepository.findAllByUser_UserIdOrderByCreatedAtDesc(userId);

		ApplicationListResponse response = new ApplicationListResponse(applications.stream()
			.map(ApplicationItem::from)
			.toList());

		log.info("[job_applications_list:completed] userId={}, count={}", userId, response.items().size());

		return response;
	}

	// 지원 내역 세부 조회
	@Transactional(readOnly = true)
	public PortfolioFileItem findApplicationPortfolio(Long userId, Long applicationId) {
		log.info("[job_application_portfolios:requested] userId={}, applicationId={}", userId, applicationId);

		Application application = applicationRepository.findByApplicationIdAndUser_UserId(applicationId, userId)
			.orElseThrow(() -> {
				log.warn("[job_application_portfolios:failed] reason=not_found userId={}, applicationId={}",
					userId, applicationId);
				return new CustomException(JOB_NOT_FOUND);
			});

		PortfolioFileItem portfolio = PortfolioFileItem.from(application.getResume());

		log.info("[job_application_portfolios:completed] userId={}, applicationId={}, hasPortfolio={}",
			userId, applicationId, portfolio != null);

		return portfolio;
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
			Resume resume = Resume.builder()
				.user(user)
				.name(resolveFilename(file))
				.url(fileUrl)
				.build();
			resumeRepository.save(resume);
			application.attachResume(resume);
			applicationRepository.save(application);
			return;
		}
	}

	private String resolveFilename(MultipartFile file) {
		return file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()
			? "attachment"
			: file.getOriginalFilename();
	}

	private int countAttachableFiles(MultipartFile[] files) {
		if (files == null || files.length == 0) {
			return 0;
		}

		int count = 0;
		for (MultipartFile file : files) {
			if (file != null && !file.isEmpty()) {
				count++;
			}
		}
		return count;
	}
}
