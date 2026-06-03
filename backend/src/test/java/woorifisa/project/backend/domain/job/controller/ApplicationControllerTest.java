package woorifisa.project.backend.domain.job.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import woorifisa.project.backend.domain.job.dto.response.ApplicationItem;
import woorifisa.project.backend.domain.job.dto.response.ApplicationListResponse;
import woorifisa.project.backend.domain.job.dto.response.PortfolioFileItem;
import woorifisa.project.backend.domain.job.entity.enums.ApplicationStatus;
import woorifisa.project.backend.domain.job.service.JobService;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationEntryPoint;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationFilter;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.config.SecurityConfig;

@WebMvcTest(ApplicationController.class)
@Import({SecurityConfig.class, SessionAuthenticationFilter.class, SessionAuthenticationEntryPoint.class})
@ImportAutoConfiguration({
	SecurityAutoConfiguration.class,
	ServletWebSecurityAutoConfiguration.class,
	SecurityFilterAutoConfiguration.class
})
class ApplicationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private JobService jobService;

	@MockitoBean
	private JpaMetamodelMappingContext jpaMetamodelMappingContext;

	@Test
	@DisplayName("authenticated user can find paged application list without portfolio file")
	void findApplications() throws Exception {
		when(jobService.findApplications(eq(1L), any(Pageable.class)))
			.thenReturn(new ApplicationListResponse(List.of(new ApplicationItem(
				99L,
				10L,
				"Clinic manager opening",
				LocalDateTime.of(2026, 6, 18, 9, 0),
				ApplicationStatus.FAILED
			)), 0, 10, true));

		mockMvc.perform(get("/applications")
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
			.andExpect(jsonPath("$.data.has_next").value(true))
			.andExpect(jsonPath("$.data.items[0].portfolio").doesNotExist())
			.andExpect(jsonPath("$.data.items[0].country_code").doesNotExist())
			.andExpect(jsonPath("$.data.items[0].phone").doesNotExist())
			.andExpect(jsonPath("$.data.items[0].recommender").doesNotExist());

		verify(jobService).findApplications(eq(1L), any(Pageable.class));
	}

	@Test
	@DisplayName("authenticated user can find selected application's portfolio file")
	void findApplicationPortfolio() throws Exception {
		when(jobService.findApplicationPortfolio(1L, 99L))
			.thenReturn(new PortfolioFileItem("조수재 포트폴리오.pdf", "https://cdn.test/portfolio.pdf"));

		mockMvc.perform(get("/applications/{applicationId}/portfolios", 99L)
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
	@DisplayName("unauthenticated user cannot find application list")
	void findApplicationsUnauthorized() throws Exception {
		mockMvc.perform(get("/applications")
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
