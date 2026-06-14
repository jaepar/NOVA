package woorifisa.project.backend.global.admin.controller;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.global.admin.dto.request.DocumentReviewRequest;
import woorifisa.project.backend.global.admin.service.AdminService;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

	private final AdminService adminDocumentReviewService;

	@PatchMapping("/users/{userId}/documents/{documentType}")
	public BaseResponse<Void> reviewUserDocument(
		@PathVariable Long userId,
		@PathVariable String documentType,
		@Valid @RequestBody DocumentReviewRequest request
	) {
		adminDocumentReviewService.reviewDocument(userId, documentType, request.targetStatus(), request.rejectionReasonCodes());
		return BaseResponse.ok(null);
	}
}
