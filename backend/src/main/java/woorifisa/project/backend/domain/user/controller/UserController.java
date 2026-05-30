package woorifisa.project.backend.domain.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import woorifisa.project.backend.domain.user.service.UserService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;
import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BaseResponse<Void> uploadDocuments(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @RequestPart(value = "residenceVerificationPdf", required = false) MultipartFile residenceVerificationPdf,
            @RequestPart(value = "alienRegistrationApplicationPdf", required = false) MultipartFile alienRegistrationApplicationPdf
    ) {
        userService.uploadDocuments(principal.userId(), residenceVerificationPdf, alienRegistrationApplicationPdf);
        return BaseResponse.ok(null);
    }

    @PostMapping("/verifications/liveness")
    public BaseResponse<LivenessSessionResponse> createLivenessSession(
            @AuthenticationPrincipal SessionUserPrincipal principal
    ) {
        return BaseResponse.ok(userService.createLivenessSession(principal.userId()));
    }

    @GetMapping("/verifications/liveness/{sessionId}")
    public BaseResponse<LivenessVerificationResponse> getLivenessResult(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @PathVariable String sessionId
    ) {
        return BaseResponse.ok(userService.getLivenessResult(principal.userId(), sessionId));
    }

    @PostMapping("/verifications/liveness/{sessionId}/face-match")
    public BaseResponse<LivenessVerificationResponse> compareFaceWithRegisteredImage(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @PathVariable String sessionId,
            @Valid @RequestBody FaceMatchRequest request
    ) {
        return BaseResponse.ok(userService.compareFaceWithRegisteredImage(principal.userId(), sessionId, request));
    }

    @PostMapping("/verifications/liveness/{sessionId}/finalize")
    public BaseResponse<LivenessFinalizeResponse> finalizeLivenessVerification(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @PathVariable String sessionId,
            @Valid @RequestBody FaceMatchRequest request
    ) {
        return BaseResponse.ok(userService.finalizeVerification(principal.userId(), sessionId, request));
    }
}
