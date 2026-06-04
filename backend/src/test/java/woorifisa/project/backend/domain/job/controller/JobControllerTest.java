package woorifisa.project.backend.domain.job.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.APPLICATION_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.UNAUTHORIZED_SESSION;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import woorifisa.project.backend.domain.job.dto.response.ApplicationFormResponse;
import woorifisa.project.backend.domain.job.dto.response.ApplicationFormPortfolioResponse;
import woorifisa.project.backend.domain.job.dto.response.ApplicationItem;
import woorifisa.project.backend.domain.job.dto.response.ApplicationListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningItem;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningResponse;
import woorifisa.project.backend.domain.job.dto.response.PortfolioFileResponse;
import woorifisa.project.backend.domain.job.entity.enums.ApplicationStatus;
import woorifisa.project.backend.domain.job.service.JobService;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationEntryPoint;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationFilter;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.config.SecurityConfig;
import woorifisa.project.backend.global.exception.CustomException;

@WebMvcTest(JobController.class)
@Import({SecurityConfig.class, SessionAuthenticationFilter.class, SessionAuthenticationEntryPoint.class})
@ImportAutoConfiguration({
	SecurityAutoConfiguration.class,
	ServletWebSecurityAutoConfiguration.class,
	SecurityFilterAutoConfiguration.class
})
class JobControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private JobService jobService;

	@MockitoBean
	private JpaMetamodelMappingContext jpaMetamodelMappingContext;

	@Test
	@DisplayName("public users can find job openings")
	void findJobOpeningsPublic() throws Exception {
		JobOpeningListResponse response = new JobOpeningListResponse(
			List.of(new JobOpeningItem(
				1L,
				"ABC Company",
				"SEOUL",
				"Backend Developer",
				"IT",
				"ENTRY",
				"5 days a week",
				"Company policy",
				LocalDateTime.of(2026, 5, 13, 12, 30)
			)),
			0,
			10,
			true
		);
		when(jobService.getJobOpeningList(any(Pageable.class))).thenReturn(response);

		mockMvc.perform(get("/jobs")
				.param("page", "0")
				.param("size", "10")
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data.total_count").doesNotExist())
			.andExpect(jsonPath("$.data.total_pages").doesNotExist())
			.andExpect(jsonPath("$.data.job_openings").doesNotExist())
			.andExpect(jsonPath("$.data.page").value(0))
			.andExpect(jsonPath("$.data.size").value(10))
			.andExpect(jsonPath("$.data.has_next").value(true))
			.andExpect(jsonPath("$.data.items", hasSize(1)))
			.andExpect(jsonPath("$.data.items[0].job_id").value(1))
			.andExpect(jsonPath("$.data.items[0].company").value("ABC Company"))
			.andExpect(jsonPath("$.data.items[0].region").value("SEOUL"))
			.andExpect(jsonPath("$.data.items[0].opening_title").value("Backend Developer"))
			.andExpect(jsonPath("$.data.items[0].job_category").value("IT"))
			.andExpect(jsonPath("$.data.items[0].experience").value("ENTRY"))
			.andExpect(jsonPath("$.data.items[0].work_period").value("5 days a week"))
			.andExpect(jsonPath("$.data.items[0].salary").value("Company policy"))
			.andExpect(jsonPath("$.data.items[0].employment_type").doesNotExist())
			.andExpect(jsonPath("$.data.items[0].deadline_type").doesNotExist())
			.andExpect(jsonPath("$.data.items[0].created_at").value("2026-05-13T12:30:00"));
	}

	@Test
	@DisplayName("public users can find a job opening detail")
	void findJobOpeningPublic() throws Exception {
		JobOpeningResponse response = new JobOpeningResponse(
			1L,
			"ABC Company",
			"SEOUL",
			"Backend Developer",
			"IT",
			"ENTRY",
			"Annual 35M KRW or more",
			"UNTIL_FILLED",
			"2",
			"Java/Spring experience",
			"Any",
			"Any",
			"Backend development",
			"1 year or more",
			"FULL_TIME",
			"Meal support, insurance",
			"Seoul Gangnam-gu",
			"Company introduction"
		);
		when(jobService.getJobOpeningDetail(1L)).thenReturn(response);

		mockMvc.perform(get("/jobs/{jobId}", 1L)
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data.job_id").value(1))
			.andExpect(jsonPath("$.data.company").value("ABC Company"))
			.andExpect(jsonPath("$.data.region").value("SEOUL"))
			.andExpect(jsonPath("$.data.opening_title").value("Backend Developer"))
			.andExpect(jsonPath("$.data.job_category").value("IT"))
			.andExpect(jsonPath("$.data.experience").value("ENTRY"))
			.andExpect(jsonPath("$.data.salary").value("Annual 35M KRW or more"))
			.andExpect(jsonPath("$.data.deadline_type").value("UNTIL_FILLED"))
			.andExpect(jsonPath("$.data.recruit_count").value("2"))
			.andExpect(jsonPath("$.data.preferred").value("Java/Spring experience"))
			.andExpect(jsonPath("$.data.age").value("Any"))
			.andExpect(jsonPath("$.data.gender").value("Any"))
			.andExpect(jsonPath("$.data.job_role").value("Backend development"))
			.andExpect(jsonPath("$.data.work_period").value("1 year or more"))
			.andExpect(jsonPath("$.data.employment_type").value("FULL_TIME"))
			.andExpect(jsonPath("$.data.benefits").value("Meal support, insurance"))
			.andExpect(jsonPath("$.data.address").value("Seoul Gangnam-gu"))
			.andExpect(jsonPath("$.data.introduce").value("Company introduction"));
	}

	@Test
	@DisplayName("return custom error when job opening detail does not exist")
	void findJobOpeningNotFound() throws Exception {
		when(jobService.getJobOpeningDetail(999L)).thenThrow(new CustomException(APPLICATION_NOT_FOUND));

		mockMvc.perform(get("/jobs/{jobId}", 999L)
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value(APPLICATION_NOT_FOUND.getCode()))
			.andExpect(jsonPath("$.message").value(APPLICATION_NOT_FOUND.getMessage()))
			.andExpect(jsonPath("$.data").doesNotExist());
	}

	@Test
	@DisplayName("authenticated user can find job application form data")
	void getApplicationForm() throws Exception {
		ApplicationFormResponse response = new ApplicationFormResponse(
			1L,
			"Cho Woojae",
			"woojae.cho@example.com",
			List.of(new ApplicationFormPortfolioResponse(
				3L,
				"portfolio.pdf",
				"https://s3.test/portfolios/user-1/profile/portfolio.pdf"
			))
		);
		when(jobService.getApplicationForm(1L)).thenReturn(response);

		mockMvc.perform(get("/jobs/applications/form")
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data.user_id").value(1))
			.andExpect(jsonPath("$.data.name").value("Cho Woojae"))
			.andExpect(jsonPath("$.data.email").value("woojae.cho@example.com"))
			.andExpect(jsonPath("$.data.portfolios", hasSize(1)))
			.andExpect(jsonPath("$.data.portfolios[0].portfolio_id").value(3))
			.andExpect(jsonPath("$.data.portfolios[0].name").value("portfolio.pdf"))
			.andExpect(jsonPath("$.data.portfolios[0].url").value("https://s3.test/portfolios/user-1/profile/portfolio.pdf"));

		verify(jobService).getApplicationForm(1L);
	}

	@Test
	@DisplayName("authenticated user can find paged application list")
	void findApplications() throws Exception {
		when(jobService.findApplications(eq(1L), any(Pageable.class)))
			.thenReturn(new ApplicationListResponse(List.of(new ApplicationItem(
				99L,
				10L,
				"Clinic manager opening",
				LocalDateTime.of(2026, 6, 18, 9, 0),
				ApplicationStatus.FAILED
			)), 0, 10, true));

		mockMvc.perform(get("/jobs/applications")
				.param("page", "0")
				.param("size", "10")
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data.items", hasSize(1)))
			.andExpect(jsonPath("$.data.items[0].application_id").value(99))
			.andExpect(jsonPath("$.data.items[0].job_id").value(10))
			.andExpect(jsonPath("$.data.items[0].opening_title").value("Clinic manager opening"))
			.andExpect(jsonPath("$.data.items[0].applied_at").value("2026-06-18T09:00:00"))
			.andExpect(jsonPath("$.data.items[0].status").value("FAILED"))
			.andExpect(jsonPath("$.data.page").value(0))
			.andExpect(jsonPath("$.data.size").value(10))
			.andExpect(jsonPath("$.data.has_next").value(true));

		verify(jobService).findApplications(eq(1L), any(Pageable.class));
	}

	@Test
	@DisplayName("authenticated user can find selected application's portfolio file")
	void findApplicationPortfolio() throws Exception {
		when(jobService.findApplicationPortfolio(1L, 99L))
			.thenReturn(new PortfolioFileResponse("조수재 포트폴리오.pdf", "https://cdn.test/portfolio.pdf"));

		mockMvc.perform(get("/jobs/applications/{applicationId}/portfolios", 99L)
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data.name").value("조수재 포트폴리오.pdf"))
			.andExpect(jsonPath("$.data.url").value("https://cdn.test/portfolio.pdf"));

		verify(jobService).findApplicationPortfolio(1L, 99L);
	}

	@Test
	@DisplayName("unauthenticated user cannot find job application form data")
	void getApplicationFormUnauthorized() throws Exception {
		mockMvc.perform(get("/jobs/applications/form")
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value(UNAUTHORIZED_SESSION.getCode()))
			.andExpect(jsonPath("$.message").value(UNAUTHORIZED_SESSION.getMessage()))
			.andExpect(jsonPath("$.data").doesNotExist());
	}

	@Test
	@DisplayName("unauthenticated user cannot find application list")
	void findApplicationsUnauthorized() throws Exception {
		mockMvc.perform(get("/jobs/applications")
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value(UNAUTHORIZED_SESSION.getCode()))
			.andExpect(jsonPath("$.message").value(UNAUTHORIZED_SESSION.getMessage()))
			.andExpect(jsonPath("$.data").doesNotExist());
	}

	@Test
	@DisplayName("authenticated user can submit a job application with optional files")
	void createApplication() throws Exception {
		MockMultipartFile file = new MockMultipartFile("files", "resume.pdf", "application/pdf", "resume".getBytes());

		mockMvc.perform(multipart("/jobs/{jobId}/applications", 10L)
				.file(file)
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data").doesNotExist());

		verify(jobService).createApplication(
			eq(1L),
			eq(10L),
			any()
		);
	}

	@Test
	@DisplayName("unauthenticated user cannot submit a job application")
	void createApplicationUnauthorized() throws Exception {
		mockMvc.perform(multipart("/jobs/{jobId}/applications", 10L)
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value(UNAUTHORIZED_SESSION.getCode()))
			.andExpect(jsonPath("$.message").value(UNAUTHORIZED_SESSION.getMessage()))
			.andExpect(jsonPath("$.data").doesNotExist());
	}

	private UsernamePasswordAuthenticationToken authToken() {
		return new UsernamePasswordAuthenticationToken(
			new SessionUserPrincipal(1L),
			null,
			AuthorityUtils.NO_AUTHORITIES
		);
	}
}
