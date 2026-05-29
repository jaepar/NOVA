package woorifisa.project.backend.domain.user.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import woorifisa.project.backend.domain.user.service.UserService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;

@WebMvcTest(UserController.class)
class UserControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private UserService userService;

	@MockitoBean
	private JpaMetamodelMappingContext jpaMetamodelMappingContext;

	@Test
	@DisplayName("문서 업로드 API 호출에 성공한다")
	void uploadDocumentsSuccess() throws Exception {
		MockMultipartFile residencePdf = new MockMultipartFile(
			"residenceVerificationPdf",
			"residence.pdf",
			MediaType.APPLICATION_PDF_VALUE,
			"residence".getBytes()
		);
		MockMultipartFile alienPdf = new MockMultipartFile(
			"alienRegistrationApplicationPdf",
			"alien.pdf",
			MediaType.APPLICATION_PDF_VALUE,
			"alien".getBytes()
		);

		doNothing().when(userService).uploadDocuments(any(), any(), any());

		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
			new SessionUserPrincipal(1L),
			null,
			AuthorityUtils.NO_AUTHORITIES
		);

		mockMvc.perform(multipart("/users/documents")
				.file(residencePdf)
				.file(alienPdf)
				.with(authentication(authToken))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"));
	}
}
