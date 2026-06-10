package woorifisa.project.backend.domain.user.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.request.IdentityVerificationConfirmRequest;
import woorifisa.project.backend.domain.user.dto.request.OcrDocumentType;
import woorifisa.project.backend.domain.user.dto.request.UpdateUserRequest;
import woorifisa.project.backend.domain.user.dto.response.CorrectionDocumentResponse;
import woorifisa.project.backend.domain.user.dto.response.IdentityOcrResponse;
import woorifisa.project.backend.domain.user.dto.response.IdentityVerificationResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.domain.user.dto.response.NotificationResponse;
import woorifisa.project.backend.domain.user.dto.response.UserProfileResponse;
import woorifisa.project.backend.domain.user.service.IdentityVerificationService;
import woorifisa.project.backend.domain.user.service.NotificationService;
import woorifisa.project.backend.domain.user.service.UserService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

	private static final String LANGUAGE_COOKIE_NAME = "NOVA_LANGUAGE";
	private static final int LANGUAGE_COOKIE_MAX_AGE_SECONDS = 31_536_000;  // 31,536,000초 = 365일

	private final UserService userService;
	private final NotificationService notificationService;
	private final IdentityVerificationService identityVerificationService;

	// 회원 정보 조회
	@GetMapping
	public BaseResponse<UserProfileResponse> getUserProfile(
		@AuthenticationPrincipal SessionUserPrincipal principal
	) {
		return BaseResponse.ok(userService.getUserProfile(principal.userId()));
	}

	// 회원 정보 수정
	@PatchMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public BaseResponse<Void> updateUser(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@Valid @RequestPart(value = "request", required = false) UpdateUserRequest request,
		@RequestPart(value = "portfolioFiles", required = false) List<MultipartFile> portfolioFiles,
		HttpServletResponse response  // 언어 변경 시 응답 헤더에 Set-Cookie를 직접 추가하기 위해 사용한다.
	) {
		// 회원 정보 수정은 multipart 요청으로 들어온 항목만 선택적으로 반영한다.
		Long userId = principal.userId();
		log.info("회원 정보 수정 API 요청: userId={}", userId);
		userService.updateUser(userId, request, portfolioFiles);
		if (request != null && request.language() != null && !request.language().isBlank()) {
			// 언어는 회원 원장성 정보가 아니므로 DB에 저장하지 않고 쿠키로만 갱신한다.
			addLanguageCookie(response, request.language().trim());
			log.info("회원 정보 수정 API 언어 쿠키 갱신: userId={}", userId);
		}
		return BaseResponse.ok(null);
	}

	private void addLanguageCookie(HttpServletResponse response, String language) {
		// 브라우저가 이후 요청에서도 선택 언어를 유지하도록 Set-Cookie 헤더를 내려준다.
		ResponseCookie cookie = ResponseCookie.from(LANGUAGE_COOKIE_NAME, language)
			.path("/")
			.maxAge(LANGUAGE_COOKIE_MAX_AGE_SECONDS)
			.sameSite("Lax")
			.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}
	

	// 서류 제출
	@PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public BaseResponse<Void> uploadDocuments(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@RequestPart(value = "residenceVerificationPdf", required = false) MultipartFile residenceVerificationPdf,
		@RequestPart(value = "alienRegistrationApplicationPdf", required = false) MultipartFile alienRegistrationApplicationPdf
	) {
		userService.uploadDocuments(principal.userId(), residenceVerificationPdf, alienRegistrationApplicationPdf);
		return BaseResponse.ok(null);
	}

	// 서류 승인 알림 클릭 시 해당 알림 제거
	@PostMapping("/notifications/{notificationId}/delete")
	public BaseResponse<Void> deleteNotification(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@PathVariable Long notificationId
	) {
		notificationService.deleteNotificationById(principal.userId(), notificationId);
		return BaseResponse.ok(null);
	}

	// 알림 목록 조회
	@GetMapping("/notifications")
	public BaseResponse<List<NotificationResponse>> getNotifications(
		@AuthenticationPrincipal SessionUserPrincipal principal
	) {
		return BaseResponse.ok(notificationService.getNotifications(principal.userId()));
	}

	// 보완 서류 목록 조회
	@GetMapping("/documents/corrections")
	public BaseResponse<List<CorrectionDocumentResponse>> getCorrectionDocuments(
		@AuthenticationPrincipal SessionUserPrincipal principal
	) {
		return BaseResponse.ok(userService.getCorrectionDocuments(principal.userId()));
	}

	// OCR 추출 처리 -> 여권/신분증 분기처리
	@PostMapping(value = "/verifications/identity", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public BaseResponse<IdentityOcrResponse> verifyIdentity(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@RequestPart("file") MultipartFile file,
		@RequestParam("ocrDocumentType") OcrDocumentType ocrDocumentType
	) {
		return BaseResponse.ok(identityVerificationService.verifyIdentity(principal.userId(), file, ocrDocumentType));
	}

	// OCR 추출값 확정 후 정부 DB 검증
	@PostMapping("/verifications/identity/confirm")
	public BaseResponse<IdentityVerificationResponse> confirmIdentity(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@Valid @RequestBody IdentityVerificationConfirmRequest request
	) {
		return BaseResponse.ok(identityVerificationService.confirmIdentity(principal.userId(), request));
	}

	// 인증서 발급 요청
	@PostMapping("/verifications")
	public BaseResponse<Void> requestCertificateIssuance(
		@AuthenticationPrincipal SessionUserPrincipal principal
	) {
		userService.requestCertificateIssuance(principal.userId());
		return BaseResponse.ok(null);
	}

	// Liveness 세션 생성
	@PostMapping("/verifications/liveness")
	public BaseResponse<LivenessSessionResponse> createLivenessSession(
		@AuthenticationPrincipal SessionUserPrincipal principal
	) {
		return BaseResponse.ok(userService.createLivenessSession(principal.userId()));
	}

	// Liveness 인증 결과 확인
	@GetMapping("/verifications/liveness/{sessionId}")
	public BaseResponse<LivenessVerificationResponse> getLivenessResult(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@PathVariable String sessionId
	) {
		return BaseResponse.ok(userService.getLivenessResult(principal.userId(), sessionId));
	}

	// Liveness 얼굴 대조
	@PostMapping("/verifications/liveness/{sessionId}/face-match")
	public BaseResponse<LivenessVerificationResponse> compareFaceWithRegisteredImage(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@PathVariable String sessionId,
		@Valid @RequestBody FaceMatchRequest request
	) {
		return BaseResponse.ok(userService.compareFaceWithRegisteredImage(principal.userId(), sessionId, request));
	}

	// Liveness 최종 인가
	@PostMapping("/verifications/liveness/{sessionId}/finalize")
	public BaseResponse<LivenessFinalizeResponse> finalizeLivenessVerification(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@PathVariable String sessionId,
		@Valid @RequestBody FaceMatchRequest request
	) {
		return BaseResponse.ok(userService.finalizeVerification(principal.userId(), sessionId, request));
	}
}
