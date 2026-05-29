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

import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.domain.user.service.UserService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;

import java.time.Instant;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

			UsernamePasswordAuthenticationToken authToken = authToken();

			mockMvc.perform(multipart("/users/documents")
					.file(residencePdf)
					.file(alienPdf)
					.with(authentication(authToken))
					.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.code").value("20000"));

			verify(userService).uploadDocuments(eq(1L), any(), any());
		}

		@Test
		@DisplayName("Liveness 세션 생성 API는 성공 응답을 반환한다")
		void createLivenessSessionReturnsSuccess() throws Exception {
			LivenessSessionResponse payload = new LivenessSessionResponse(
				"session-123",
				Instant.parse("2026-05-29T00:00:00Z")
			);

			when(userService.createLivenessSession(1L)).thenReturn(payload);

			mockMvc.perform(post("/users/liveness/session")
					.with(authentication(authToken()))
					.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.code").value("20000"))
				.andExpect(jsonPath("$.data.sessionId").value("session-123"));

			verify(userService).createLivenessSession(1L);
		}

		@Test
		@DisplayName("Liveness 결과 조회 API는 성공 응답을 반환한다")
		void getLivenessResultReturnsSuccess() throws Exception {
			LivenessVerificationResponse payload = new LivenessVerificationResponse(
				"session-123",
				"SUCCEEDED",
				95f,
				"PASS",
				"LIVENESS_PASSED"
			);

			when(userService.getLivenessResult(1L, "session-123")).thenReturn(payload);

			mockMvc.perform(get("/users/liveness/session/{sessionId}", "session-123")
					.with(authentication(authToken()))
					.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.code").value("20000"))
				.andExpect(jsonPath("$.data.sessionId").value("session-123"))
				.andExpect(jsonPath("$.data.status").value("SUCCEEDED"))
				.andExpect(jsonPath("$.data.score").value(95.0))
				.andExpect(jsonPath("$.data.decision").value("PASS"))
				.andExpect(jsonPath("$.data.reasonCode").value("LIVENESS_PASSED"));

			verify(userService).getLivenessResult(1L, "session-123");
		}

		@Test
		@DisplayName("Liveness 동일인 비교 API는 성공 응답을 반환한다")
		void compareFaceReturnsSuccess() throws Exception {
			LivenessVerificationResponse payload = new LivenessVerificationResponse(
				"session-123",
				"FACE_MATCH",
				89f,
				"PASS",
				"FACE_MATCH_PASSED"
			);

			when(userService.compareFaceWithRegisteredImage(eq(1L), eq("session-123"), any(FaceMatchRequest.class)))
				.thenReturn(payload);

			mockMvc.perform(post("/users/liveness/session/{sessionId}/face-match", "session-123")
					.with(authentication(authToken()))
					.contentType(MediaType.APPLICATION_JSON)
					.accept(MediaType.APPLICATION_JSON)
					.content("""
                                {
                                  "bucket": "bucket",
                                  "key": "registered.jpg"
                                }
                                """))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.code").value("20000"))
				.andExpect(jsonPath("$.data.sessionId").value("session-123"))
				.andExpect(jsonPath("$.data.status").value("FACE_MATCH"))
				.andExpect(jsonPath("$.data.score").value(89.0))
				.andExpect(jsonPath("$.data.decision").value("PASS"))
				.andExpect(jsonPath("$.data.reasonCode").value("FACE_MATCH_PASSED"));

			verify(userService).compareFaceWithRegisteredImage(
				eq(1L),
				eq("session-123"),
				any(FaceMatchRequest.class)
			);
		}

		@Test
		@DisplayName("Liveness 최종 확정 API는 성공 응답을 반환한다")
		void finalizeReturnsSuccess() throws Exception {
			LivenessFinalizeResponse payload = new LivenessFinalizeResponse(
				"session-123",
				95f,
				89f,
				"PASS",
				"VERIFICATION_PASSED"
			);

			when(userService.finalizeVerification(eq(1L), eq("session-123"), any(FaceMatchRequest.class)))
				.thenReturn(payload);

			mockMvc.perform(post("/users/liveness/session/{sessionId}/finalize", "session-123")
					.with(authentication(authToken()))
					.contentType(MediaType.APPLICATION_JSON)
					.accept(MediaType.APPLICATION_JSON)
					.content("""
                                {
                                  "bucket": "bucket",
                                  "key": "registered.jpg"
                                }
                                """))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.code").value("20000"))
				.andExpect(jsonPath("$.data.sessionId").value("session-123"))
				.andExpect(jsonPath("$.data.livenessScore").value(95.0))
				.andExpect(jsonPath("$.data.similarityScore").value(89.0))
				.andExpect(jsonPath("$.data.decision").value("PASS"))
				.andExpect(jsonPath("$.data.reasonCode").value("VERIFICATION_PASSED"));

			verify(userService).finalizeVerification(
				eq(1L),
				eq("session-123"),
				any(FaceMatchRequest.class)
			);
		}

		private UsernamePasswordAuthenticationToken authToken() {
			return new UsernamePasswordAuthenticationToken(
				new SessionUserPrincipal(1L),
				null,
				AuthorityUtils.NO_AUTHORITIES
			);
		}
}

