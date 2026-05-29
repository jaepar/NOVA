package woorifisa.project.backend.global.admin.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import woorifisa.project.backend.global.admin.service.AdminService;

@WebMvcTest(AdminController.class)
class AdminDocumentReviewControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private AdminService adminDocumentReviewService;

	@MockitoBean
	private JpaMetamodelMappingContext jpaMetamodelMappingContext;

	@Test
	@DisplayName("관리자 서류 심사 API 호출에 성공한다")
	void reviewUserDocumentSuccess() throws Exception {
		doNothing().when(adminDocumentReviewService).reviewDocument(
			eq(1L),
			eq("ALIEN_REGISTRATION_APPLICATION"),
			eq("REJECTED"),
			eq("name,issue_date,signature")
		);

		mockMvc.perform(patch("/admin/users/1/documents/ALIEN_REGISTRATION_APPLICATION")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "targetStatus": "REJECTED",
					  "missing": "name,issue_date,signature"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"));
	}
}
