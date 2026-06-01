package woorifisa.project.backend.domain.user.controller;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.domain.user.dto.response.PassportResponse;
import woorifisa.project.backend.domain.user.service.PassportOcrService;
import woorifisa.project.backend.domain.user.service.UserService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

	private final UserService userService;
	private final PassportOcrService passportOcrService;

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
		userService.deleteNotification(principal.userId(), notificationId);
		return BaseResponse.ok(null);
	}

	// 여권 인증
	@PostMapping(value = "/verifications/passports", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public BaseResponse<PassportResponse> recognizePassport(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@RequestPart("file") MultipartFile file
	) {
		return BaseResponse.ok(passportOcrService.recognizePassport(file));
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
