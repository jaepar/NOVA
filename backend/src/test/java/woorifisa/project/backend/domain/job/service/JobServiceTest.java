package woorifisa.project.backend.domain.job.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
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
		Job job = job(10L);
		Resume portfolio = Resume.builder()
			.resumeId(3L)
			.user(user)
			.name("portfolio.pdf")
			.url("https://s3.test/portfolios/user-1/profile/portfolio.pdf")
			.build();
		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
		when(resumeRepository.findByUserAndApplicationIsNullOrderByResumeIdDesc(user))
			.thenReturn(List.of(portfolio));

		ApplicationFormResponse response = jobService.getApplicationForm(1L, 10L);

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
	@DisplayName("missing job throws JOB_NOT_FOUND when finding application form data")
	void getApplicationFormJobNotFound() {
		when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
		when(jobRepository.findById(404L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> jobService.getApplicationForm(1L, 404L))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(JOB_NOT_FOUND);
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
	@DisplayName("uploaded files are saved to S3 and linked as resumes")
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
		assertThat(savedResume.getApplication()).isEqualTo(persisted);
		assertThat(savedResume.getName()).isEqualTo("resume.pdf");
		assertThat(savedResume.getUrl()).isEqualTo("https://s3.test/portfolios/user-1/application-99/portfolio-0_resume.pdf");
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
			.hasCertificate(false)
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
}
