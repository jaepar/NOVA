package woorifisa.project.backend.domain.job.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.APPLICATION_ALREADY_EXISTS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.JOB_NOT_FOUND;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import woorifisa.project.backend.domain.job.dto.response.ApplicationFormResponse;
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
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.repository.ResumeRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.domain.user.service.PortfolioFileS3Uploader;
import woorifisa.project.backend.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

	@Mock
	private JobRepository jobRepository;

	@Mock
	private ApplicationRepository applicationRepository;

	@Mock
	private UserRepository userRepository;

	@Mock
	private ResumeRepository resumeRepository;

	@Mock
	private PortfolioFileS3Uploader portfolioFileS3Uploader;

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
		assertThat(response.openingTitle()).isEqualTo("Backend Developer");
		assertThat(response.jobRole()).isEqualTo("Backend development");
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

	@Test
	@DisplayName("get application form data for authenticated user")
	void getApplicationForm() {
		User user = user(1L);
		Resume portfolio = Resume.builder()
			.resumeId(3L)
			.user(user)
			.name("portfolio.pdf")
			.url("https://s3.test/portfolios/user-1/profile/portfolio.pdf")
			.build();
		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(resumeRepository.findByUserOrderByResumeIdDesc(user))
			.thenReturn(List.of(portfolio));

		ApplicationFormResponse response = jobService.getApplicationForm(1L);

		assertThat(response.userId()).isEqualTo(1L);
		assertThat(response.name()).isEqualTo("Cho Woojae");
		assertThat(response.email()).isEqualTo("woojae.cho@example.com");
		assertThat(response.portfolios()).hasSize(1);
		assertThat(response.portfolios().get(0).portfolioId()).isEqualTo(3L);
		assertThat(response.portfolios().get(0).name()).isEqualTo("portfolio.pdf");
		assertThat(response.portfolios().get(0).url())
			.isEqualTo("https://s3.test/portfolios/user-1/profile/portfolio.pdf");
	}

	@Test
	@DisplayName("find authenticated user's applications with attached portfolio")
	void findApplications() {
		User user = user(1L);
		Job firstJob = job(10L, "Hospital", "Seoul", "피부과 상담실장 모집", LocalDateTime.of(2026, 6, 1, 9, 0));
		Job secondJob = job(20L, "Clinic", "Busan", "간호사 채용 공고", LocalDateTime.of(2026, 6, 2, 9, 0));
		Resume portfolio = Resume.builder()
			.resumeId(3L)
			.user(user)
			.name("조수재 포트폴리오.pdf")
			.url("https://cdn.test/portfolio.pdf")
			.build();
		Application firstApplication = application(100L, user, firstJob, portfolio, ApplicationStatus.FAILED,
			LocalDateTime.of(2026, 6, 18, 9, 0));
		Application secondApplication = application(200L, user, secondJob, null, ApplicationStatus.PASSED,
			LocalDateTime.of(2026, 6, 12, 9, 0));

		when(applicationRepository.findAllByUser_UserIdOrderByCreatedAtDesc(1L))
			.thenReturn(List.of(firstApplication, secondApplication));

		ApplicationListResponse response = jobService.findApplications(1L);

		verify(applicationRepository).findAllByUser_UserIdOrderByCreatedAtDesc(1L);
		assertThat(response.items()).hasSize(2);
		assertThat(response.items().get(0).applicationId()).isEqualTo(100L);
		assertThat(response.items().get(0).jobId()).isEqualTo(10L);
		assertThat(response.items().get(0).openingTitle()).isEqualTo("피부과 상담실장 모집");
		assertThat(response.items().get(0).appliedAt()).isEqualTo(LocalDateTime.of(2026, 6, 18, 9, 0));
		assertThat(response.items().get(0).status()).isEqualTo(ApplicationStatus.FAILED);
	}

	@Test
	@DisplayName("return empty application list when user has no applications")
	void findApplicationsEmpty() {
		when(applicationRepository.findAllByUser_UserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

		ApplicationListResponse response = jobService.findApplications(1L);

		assertThat(response.items()).isEmpty();
	}

	@Test
	@DisplayName("find selected application's attached portfolio")
	void findApplicationPortfolio() {
		User user = user(1L);
		Job job = job(10L);
		Resume portfolio = Resume.builder()
			.resumeId(3L)
			.user(user)
			.name("조수재 포트폴리오.pdf")
			.url("https://cdn.test/portfolio.pdf")
			.build();
		Application application = application(100L, user, job, portfolio, ApplicationStatus.FAILED,
			LocalDateTime.of(2026, 6, 18, 9, 0));

		when(applicationRepository.findByApplicationIdAndUser_UserId(100L, 1L))
			.thenReturn(Optional.of(application));

		PortfolioFileItem response = jobService.findApplicationPortfolio(1L, 100L);

		assertThat(response.name()).isEqualTo("조수재 포트폴리오.pdf");
		assertThat(response.url()).isEqualTo("https://cdn.test/portfolio.pdf");
	}

	@Test
	@DisplayName("return null portfolio when selected application has no attached portfolio")
	void findApplicationPortfolioEmpty() {
		User user = user(1L);
		Job job = job(10L);
		Application application = application(100L, user, job, null, ApplicationStatus.FAILED,
			LocalDateTime.of(2026, 6, 18, 9, 0));

		when(applicationRepository.findByApplicationIdAndUser_UserId(100L, 1L))
			.thenReturn(Optional.of(application));

		PortfolioFileItem response = jobService.findApplicationPortfolio(1L, 100L);

		assertThat(response).isNull();
	}

	@Test
	@DisplayName("authenticated user creates an unread application without files")
	void createApplicationWithoutFiles() {
		User user = user(1L);
		Job job = job(10L);

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
		when(applicationRepository.existsByUserAndJob(user, job)).thenReturn(false);
		when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> invocation.getArgument(0));

		jobService.createApplication(1L, 10L, null);

		ArgumentCaptor<Application> applicationCaptor = ArgumentCaptor.forClass(Application.class);
		verify(applicationRepository).save(applicationCaptor.capture());
		Application saved = applicationCaptor.getValue();
		assertThat(saved.getUser()).isEqualTo(user);
		assertThat(saved.getJob()).isEqualTo(job);
		assertThat(saved.getStatus()).isEqualTo(ApplicationStatus.UNREAD);
		verify(portfolioFileS3Uploader, never()).upload(any(), any(), anyInt(), any());
		verify(resumeRepository, never()).save(any());
	}

	@Test
	@DisplayName("uploaded file is saved to S3 and linked to application as resume")
	void createApplicationWithFiles() {
		User user = user(1L);
		Job job = job(10L);
		Application persisted = Application.builder()
			.applicationId(99L)
			.user(user)
			.job(job)
			.status(ApplicationStatus.UNREAD)
			.build();
		MockMultipartFile file = new MockMultipartFile("files", "resume.pdf", "application/pdf", "resume".getBytes());

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
		when(applicationRepository.existsByUserAndJob(user, job)).thenReturn(false);
		when(applicationRepository.save(any(Application.class))).thenReturn(persisted);
		when(portfolioFileS3Uploader.upload(1L, 99L, 0, file))
			.thenReturn("https://s3.test/portfolios/user-1/application-99/portfolio-0_resume.pdf");

		jobService.createApplication(
			1L,
			10L,
			new MockMultipartFile[] {file}
		);

		ArgumentCaptor<Resume> resumeCaptor = ArgumentCaptor.forClass(Resume.class);
		verify(resumeRepository).save(resumeCaptor.capture());
		Resume savedResume = resumeCaptor.getValue();
		assertThat(savedResume.getUser()).isEqualTo(user);
		assertThat(savedResume.getName()).isEqualTo("resume.pdf");
		assertThat(savedResume.getUrl()).isEqualTo("https://s3.test/portfolios/user-1/application-99/portfolio-0_resume.pdf");
		assertThat(persisted.getResume()).isEqualTo(savedResume);

		ArgumentCaptor<Application> applicationCaptor = ArgumentCaptor.forClass(Application.class);
		verify(applicationRepository, times(2)).save(applicationCaptor.capture());
		assertThat(applicationCaptor.getAllValues().get(1).getResume()).isEqualTo(savedResume);
	}

	@Test
	@DisplayName("missing job throws JOB_NOT_FOUND when applying")
	void createApplicationJobNotFound() {
		when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
		when(jobRepository.findById(404L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> jobService.createApplication(1L, 404L, null))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(JOB_NOT_FOUND);
	}

	@Test
	@DisplayName("same user cannot apply to the same job twice")
	void createApplicationDuplicate() {
		User user = user(1L);
		Job job = job(10L);
		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
		when(applicationRepository.existsByUserAndJob(user, job)).thenReturn(true);

		assertThatThrownBy(() -> jobService.createApplication(1L, 10L, null))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(APPLICATION_ALREADY_EXISTS);
	}

	private User user(Long userId) {
		return User.builder()
			.userId(userId)
			.name("Cho Woojae")
			.birth("950101")
			.email("woojae.cho@example.com")
			.password("password")
			.certificateStatus(CertificateStatus.NOT_ISSUED)
			.hasResidenceCard(false)
			.hasDelete(false)
			.build();
	}

	private Job job(Long jobId) {
		return job(jobId, "Hospital", "Seoul", "Nurse", LocalDateTime.of(2026, 5, 13, 12, 30));
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

	private Application application(
		Long applicationId,
		User user,
		Job job,
		Resume resume,
		ApplicationStatus status,
		LocalDateTime createdAt
	) {
		Application application = Application.builder()
			.applicationId(applicationId)
			.user(user)
			.job(job)
			.resume(resume)
			.status(status)
			.build();
		ReflectionTestUtils.setField(application, "createdAt", createdAt);
		return application;
	}
}
