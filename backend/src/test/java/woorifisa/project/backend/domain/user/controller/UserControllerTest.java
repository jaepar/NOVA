package woorifisa.project.backend.domain.user.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MultipartFile;

import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.request.OcrDocumentType;
import woorifisa.project.backend.domain.user.dto.request.UpdateUserRequest;
import woorifisa.project.backend.domain.user.dto.response.IdentityOcrResponse;
import woorifisa.project.backend.domain.user.dto.response.IdentityVerificationResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.domain.user.dto.response.ocr.IdCardOcrResponse;
import woorifisa.project.backend.domain.user.dto.response.ocr.PassportOcrResponse;
import woorifisa.project.backend.domain.user.service.IdentityVerificationService;
import woorifisa.project.backend.domain.user.service.NotificationService;
import woorifisa.project.backend.domain.user.service.UserService;
import woorifisa.project.backend.domain.user.service.ocr.PassportOcrService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private UserService userService;

	@MockitoBean
	private PassportOcrService passportOcrService;

	@MockitoBean
	private NotificationService notificationService;

	@MockitoBean
	private IdentityVerificationService identityVerificationService;

	@MockitoBean
	private JpaMetamodelMappingContext jpaMetamodelMappingContext;

	@Test
	@DisplayName("PATCH /users changes language cookie")
	void updateUserLanguageReturnsLanguageCookie() throws Exception {
		doNothing().when(userService).updateUser(nullable(Long.class), any(UpdateUserRequest.class), nullable(List.class));

		mockMvc.perform(multipart("/users")
				.file(jsonRequestPart("{\"language\":\"ko\"}"))
				.with(request -> {
					request.setMethod("PATCH");
					return request;
				})
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.message").value("요청에 성공했습니다."))
			.andExpect(cookie().value("NOVA_LANGUAGE", "ko"))
			.andExpect(cookie().maxAge("NOVA_LANGUAGE", 31_536_000));

		verify(userService).updateUser(nullable(Long.class), argThat(request -> "ko".equals(request.language())), nullable(List.class));
	}

	@Test
	@DisplayName("PATCH /users accepts password fields")
	void updateUserPasswordFields() throws Exception {
		doNothing().when(userService).updateUser(nullable(Long.class), any(UpdateUserRequest.class), nullable(List.class));

		mockMvc.perform(multipart("/users")
				.file(jsonRequestPart("""
					{
					  "currentPassword": "Password123!",
					  "newPassword": "NewPassword123!",
					  "newPasswordConfirm": "NewPassword123!"
					}
					"""))
				.with(request -> {
					request.setMethod("PATCH");
					return request;
				})
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("20000"));

		verify(userService).updateUser(nullable(Long.class), argThat(request ->
			"Password123!".equals(request.currentPassword())
				&& "NewPassword123!".equals(request.newPassword())
				&& "NewPassword123!".equals(request.newPasswordConfirm())
		), nullable(List.class));
	}

	@Test
	@DisplayName("PATCH /users accepts multiple portfolio uploads")
	void updateUserPortfolioUploads() throws Exception {
		MockMultipartFile firstPortfolio = new MockMultipartFile(
			"portfolioFiles",
			"portfolio.pdf",
			MediaType.APPLICATION_PDF_VALUE,
			"portfolio".getBytes()
		);
		MockMultipartFile secondPortfolio = new MockMultipartFile(
			"portfolioFiles",
			"cover.docx",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"cover".getBytes()
		);
		doNothing().when(userService).updateUser(nullable(Long.class), nullable(UpdateUserRequest.class), anyList());

		mockMvc.perform(multipart("/users")
				.file(firstPortfolio)
				.file(secondPortfolio)
				.with(request -> {
					request.setMethod("PATCH");
					return request;
				})
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("20000"));

		verify(userService).updateUser(nullable(Long.class), isNull(), argThat((List<MultipartFile> files) ->
			files.size() == 2
				&& "portfolio.pdf".equals(files.get(0).getOriginalFilename())
				&& "cover.docx".equals(files.get(1).getOriginalFilename())
		));
	}

	@Test
	@DisplayName("PATCH /users accepts portfolio delete id")
	void updateUserPortfolioDelete() throws Exception {
		doNothing().when(userService).updateUser(nullable(Long.class), any(UpdateUserRequest.class), nullable(List.class));

		mockMvc.perform(multipart("/users")
				.file(jsonRequestPart("{\"deletePortfolioId\":3}"))
				.with(request -> {
					request.setMethod("PATCH");
					return request;
				})
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("20000"));

		verify(userService).updateUser(nullable(Long.class), argThat(request -> Long.valueOf(3L).equals(request.deletePortfolioId())), nullable(List.class));
	}

	@Test
	@DisplayName("PATCH /users rejects empty update")
	void updateUserRejectsEmptyRequest() throws Exception {
		doThrow(new CustomException(BaseExceptionResponseStatus.USER_UPDATE_TARGET_REQUIRED))
			.when(userService).updateUser(nullable(Long.class), nullable(UpdateUserRequest.class), nullable(List.class));

		mockMvc.perform(multipart("/users")
				.with(request -> {
					request.setMethod("PATCH");
					return request;
				})
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("USER-024"));

		verify(userService).updateUser(nullable(Long.class), isNull(), nullable(List.class));
	}

	private MockMultipartFile jsonRequestPart(String json) {
		return new MockMultipartFile(
			"request",
			"",
			MediaType.APPLICATION_JSON_VALUE,
			json.getBytes()
		);
	}

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
		@DisplayName("여권 OCR API는 성공 응답을 반환한다")
	void recognizePassportReturnsSuccess() throws Exception {
		MockMultipartFile passportImage = new MockMultipartFile(
			"file",
			"passport.jpg",
			MediaType.IMAGE_JPEG_VALUE,
			"passport".getBytes()
		);

		PassportOcrResponse payload = PassportOcrResponse.builder()
			.type("P")
			.issueCountry("KOR")
			.num("M12345678")
			.surName("KIM")
			.givenName("GILDONG")
			.nationality("KOREAN")
			.birthDate("1990.01.01")
			.sex("M")
			.issueDate("2020.01.01")
			.expireDate("2030.01.01")
			.authority("MOFA")
			.build();

		when(passportOcrService.recognizePassport(any())).thenReturn(payload);

		mockMvc.perform(multipart("/users/verifications/passports")
				.file(passportImage)
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data.num").value("M12345678"));

				verify(passportOcrService).recognizePassport(any());
		}


	@Test
	@DisplayName("인증서 발급 요청 API는 성공 응답을 반환한다")
	void requestCertificateIssuanceReturnsSuccess() throws Exception {
		doNothing().when(userService).requestCertificateIssuance(1L);

		mockMvc.perform(post("/users/verifications")
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"));

		verify(userService).requestCertificateIssuance(1L);
	}

	@Test
	@DisplayName("최종 제출 API는 서류 파일을 함께 전달할 수 있다")
	void requestCertificateIssuanceWithDocumentsReturnsSuccess() throws Exception {
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

		doNothing().when(userService).requestCertificateIssuance(any(), any(), any());

		mockMvc.perform(multipart("/users/verifications")
				.file(residencePdf)
				.file(alienPdf)
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"));

		verify(userService).requestCertificateIssuance(nullable(Long.class), any(), any());
	}

	@Test
	@DisplayName("Liveness 세션 생성 API는 성공 응답을 반환한다")
	void createLivenessSessionReturnsSuccess() throws Exception {
			LivenessSessionResponse payload = new LivenessSessionResponse(
				"session-123",
				Instant.parse("2026-05-29T00:00:00Z")
			);

			when(userService.createLivenessSession(1L)).thenReturn(payload);

			mockMvc.perform(post("/users/verifications/liveness")
					.with(authentication(authToken()))
					.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.code").value("20000"))
				.andExpect(jsonPath("$.data.sessionId").value("session-123"));

			verify(userService).createLivenessSession(1L);
		}

	@Test
	@DisplayName("신분증/여권 OCR 추출 API는 성공 응답을 반환한다")
	void recognizeIdentityReturnsSuccess() throws Exception {
		MockMultipartFile idImage = new MockMultipartFile(
			"file",
			"idcard.jpg",
			MediaType.IMAGE_JPEG_VALUE,
			"idcard".getBytes()
		);

		IdentityOcrResponse payload = IdentityOcrResponse.builder()
			.ocrDocumentType(OcrDocumentType.ID_CARD)
			.result(new IdCardOcrResponse("홍길동", "900101-1234567", "2020.01.01"))
			.build();

		when(identityVerificationService.verifyIdentity(any(), any(), eq(OcrDocumentType.ID_CARD))).thenReturn(payload);

		mockMvc.perform(multipart("/users/verifications/identity")
				.file(idImage)
				.param("ocrDocumentType", "ID_CARD")
				.with(authentication(authToken()))
				.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data.ocrDocumentType").value("ID_CARD"))
			.andExpect(jsonPath("$.data.result.residentRegistrationNumber").value("900101-1234567"));

		verify(identityVerificationService).verifyIdentity(any(), any(), eq(OcrDocumentType.ID_CARD));
	}

	@Test
	@DisplayName("신분증 OCR 확정 API는 성공 응답을 반환한다")
	void confirmIdentityReturnsSuccess() throws Exception {
		IdentityVerificationResponse payload = IdentityVerificationResponse.builder()
			.ocrDocumentType(OcrDocumentType.ID_CARD)
			.nameMatchWithUser(true)
			.identityMatchWithGovDb(true)
			.verificationStatus("VERIFIED")
			.failureReasonCode(null)
			.build();

		when(identityVerificationService.confirmIdentity(nullable(Long.class), any())).thenReturn(payload);

		mockMvc.perform(post("/users/verifications/identity/confirm")
				.with(authentication(authToken()))
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "ocrDocumentType": "ID_CARD",
					  "name": "홍길동",
					  "residentRegistrationNumber": "900101-1234567",
					  "issueDate": "2020.01.01"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data.verificationStatus").value("VERIFIED"))
			.andExpect(jsonPath("$.data.result").doesNotExist());

		verify(identityVerificationService).confirmIdentity(nullable(Long.class), any());
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

			mockMvc.perform(get("/users/verifications/liveness/{sessionId}", "session-123")
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

			mockMvc.perform(post("/users/verifications/liveness/{sessionId}/face-match", "session-123")
					.with(authentication(authToken()))
					.contentType(MediaType.APPLICATION_JSON)
					.accept(MediaType.APPLICATION_JSON)
					.content("""
                                {
                                  "registeredImageBucket": "bucket",
                                  "registeredImageKey": "registered.jpg"
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

			mockMvc.perform(post("/users/verifications/liveness/{sessionId}/finalize", "session-123")
					.with(authentication(authToken()))
					.contentType(MediaType.APPLICATION_JSON)
					.accept(MediaType.APPLICATION_JSON)
					.content("""
                                {
                                  "registeredImageBucket": "bucket",
                                  "registeredImageKey": "registered.jpg"
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
