package woorifisa.project.backend.domain.job.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.APPLICATION_ALREADY_EXISTS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.APPLICATION_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import woorifisa.project.backend.domain.job.dto.request.ApplicationCreateRequest;
import woorifisa.project.backend.domain.job.dto.response.ApplicationFormResponse;
import woorifisa.project.backend.domain.job.dto.response.ApplicationFormPortfolioResponse;
import woorifisa.project.backend.domain.job.dto.response.ApplicationListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningResponse;
import woorifisa.project.backend.domain.job.dto.response.PortfolioFileResponse;
import woorifisa.project.backend.domain.job.entity.Application;
import woorifisa.project.backend.domain.job.entity.ApplicationResume;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.job.entity.enums.ApplicationStatus;
import woorifisa.project.backend.domain.job.repository.ApplicationResumeRepository;
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
	private final ApplicationResumeRepository applicationResumeRepository;
	private final UserRepository userRepository;
	private final ResumeRepository resumeRepository;
	private final PortfolioFileS3Uploader portfolioFileS3Uploader;
	private final JdbcTemplate jdbcTemplate;

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
				return new CustomException(APPLICATION_NOT_FOUND);
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

	// 지원서는 로그인 사용자와 공고로 생성하고, 기존 S3 포트폴리오 URL과 신규 첨부파일을 모두 연결한다.
	@Transactional
	public void createApplication(
		Long userId,
		Long jobId,
		ApplicationCreateRequest request,
		List<MultipartFile> files
	) {
		List<String> portfolioUrls = request == null ? List.of() : request.portfolioUrlsOrEmpty();
		log.info("[job_application_submit:requested] userId={}, jobId={}, portfolioUrlCount={}, fileCount={}",
			userId, jobId, portfolioUrls.size(), countAttachableFiles(files));

		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));
		Job job = jobRepository.findById(jobId)
			.orElseThrow(() -> {
				log.warn("job application submit failed. reason=job_not_found userId={}, jobId={}", userId, jobId);
				return new CustomException(APPLICATION_NOT_FOUND);
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

		int attachedCount = savePortfolioUrls(user, application, portfolioUrls)
			+ saveFiles(user, application, files);

		log.info("[job_application_submit:completed] userId={}, jobId={}, applicationId={}, attachedCount={}",
			userId, jobId, application.getApplicationId(), attachedCount);
	}

	// 지원 내역 전체 조회
	@Transactional(readOnly = true)
	public ApplicationListResponse findApplications(Long userId, Pageable pageable) {
		log.info("[job_applications_list:requested] userId={}, page={}, size={}",
			userId, pageable.getPageNumber(), pageable.getPageSize());

		Slice<Application> applications = applicationRepository.findAllByUser_UserId(userId, pageable);

		ApplicationListResponse response = ApplicationListResponse.from(applications);

		log.info("[job_applications_list:completed] userId={}, page={}, size={}, count={}, hasNext={}",
			userId, response.page(), response.size(), response.items().size(), response.hasNext());

		return response;
	}

	// 지원 내역 세부 조회
	@Transactional(readOnly = true)
	public List<PortfolioFileResponse> findApplicationPortfolio(Long userId, Long applicationId) {
		log.info("[job_application_portfolios:requested] userId={}, applicationId={}", userId, applicationId);

		applicationRepository.findByApplicationIdAndUser_UserId(applicationId, userId)
			.orElseThrow(() -> {
				log.warn("[job_application_portfolios:failed] reason=not_found userId={}, applicationId={}",
					userId, applicationId);
				return new CustomException(APPLICATION_NOT_FOUND);
			});

		List<PortfolioFileResponse> portfolios = applicationResumeRepository
			.findAllPortfolios(applicationId, userId)
			.stream()
			.map(ApplicationResume::getResume)
			.map(PortfolioFileResponse::from)
			.toList();
		List<PortfolioFileResponse> legacyPortfolios = findLegacyApplicationPortfolio(userId, applicationId);
		List<PortfolioFileResponse> mergedPortfolios = mergePortfolios(portfolios, legacyPortfolios);

		log.info(
			"[job_application_portfolios:completed] userId={}, applicationId={}, joinTableCount={}, legacyCount={}, count={}",
			userId, applicationId, portfolios.size(), legacyPortfolios.size(), mergedPortfolios.size());

		return mergedPortfolios;
	}

	private List<PortfolioFileResponse> mergePortfolios(
		List<PortfolioFileResponse> portfolios,
		List<PortfolioFileResponse> legacyPortfolios
	) {
		Map<String, PortfolioFileResponse> portfolioByUrl = new LinkedHashMap<>();
		for (PortfolioFileResponse portfolio : portfolios) {
			putPortfolioByUrl(portfolioByUrl, portfolio);
		}
		for (PortfolioFileResponse legacyPortfolio : legacyPortfolios) {
			putPortfolioByUrl(portfolioByUrl, legacyPortfolio);
		}
		return List.copyOf(portfolioByUrl.values());
	}

	private void putPortfolioByUrl(
		Map<String, PortfolioFileResponse> portfolioByUrl,
		PortfolioFileResponse portfolio
	) {
		if (portfolio == null || portfolio.url() == null || portfolio.url().isBlank()) {
			return;
		}
		portfolioByUrl.putIfAbsent(portfolio.url(), portfolio);
	}

	private List<PortfolioFileResponse> findLegacyApplicationPortfolio(Long userId, Long applicationId) {
		if (!hasLegacyApplicationResumeColumn()) {
			return List.of();
		}

		return jdbcTemplate.query(
			"""
				select resume.name, resume.url
				from `application` application
				join resume resume on resume.resume_id = application.resume_id
				where application.application_id = ?
					and application.user_id = ?
					and application.resume_id is not null
				""",
			(resultSet, rowNumber) -> new PortfolioFileResponse(
				resultSet.getString("name"),
				resultSet.getString("url")
			),
			applicationId,
			userId
		);
	}

	private boolean hasLegacyApplicationResumeColumn() {
		try {
			Boolean exists = jdbcTemplate.queryForObject(
				"""
					select exists(
						select 1
						from information_schema.columns
						where table_schema = database()
							and table_name = 'application'
							and column_name = 'resume_id'
					)
					""",
				Boolean.class
			);
			return Boolean.TRUE.equals(exists);
		} catch (DataAccessException exception) {
			log.warn("[job_application_portfolios:legacy_column_check_failed] message={}", exception.getMessage());
			return false;
		}
	}

	private int savePortfolioUrls(User user, Application application, List<String> portfolioUrls) {
		List<Resume> resumes = portfolioUrls.stream()
			.filter(url -> url != null && !url.isBlank())
			.distinct()
			.map(url -> findOrCreateResumeByUrl(user, url))
			.toList();

		for (Resume resume : resumes) {
			linkResume(application, resume);
		}

		return resumes.size();
	}

	private Resume findOrCreateResumeByUrl(User user, String url) {
		return resumeRepository.findByUserAndUrl(user, url)
			.orElseGet(() -> resumeRepository.save(Resume.builder()
				.user(user)
				.name(resolveFilename(url))
				.url(url)
				.build()));
	}

	private int saveFiles(User user, Application application, List<MultipartFile> files) {
		if (files == null || files.isEmpty()) {
			return 0;
		}

		int savedCount = 0;
		for (int i = 0; i < files.size(); i++) {
			MultipartFile file = files.get(i);
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
			linkResume(application, resumeRepository.save(resume));
			savedCount++;
		}
		return savedCount;
	}

	private void linkResume(Application application, Resume resume) {
		applicationResumeRepository.save(ApplicationResume.builder()
			.application(application)
			.resume(resume)
			.build());
	}

	private String resolveFilename(MultipartFile file) {
		return file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()
			? "attachment"
			: file.getOriginalFilename();
	}

	private String resolveFilename(String url) {
		try {
			String path = new URI(url).getPath();
			if (path == null || path.isBlank()) {
				return "portfolio";
			}

			String filename = path.substring(path.lastIndexOf('/') + 1);
			return filename.isBlank() ? "portfolio" : filename;
		} catch (URISyntaxException exception) {
			return "portfolio";
		}
	}

	private int countAttachableFiles(List<MultipartFile> files) {
		if (files == null || files.isEmpty()) {
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
