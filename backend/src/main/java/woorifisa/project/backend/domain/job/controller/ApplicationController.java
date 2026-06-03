package woorifisa.project.backend.domain.job.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.domain.job.dto.response.ApplicationListResponse;
import woorifisa.project.backend.domain.job.dto.response.PortfolioFileItem;
import woorifisa.project.backend.domain.job.service.JobService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/applications")
public class ApplicationController {

	private final JobService jobService;

	// 지원 내역 목록 조회
	@GetMapping
	public BaseResponse<ApplicationListResponse> findApplications(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return BaseResponse.ok(jobService.findApplications(principal.userId(), pageable));
	}

	// 지원 내역 세부 조회
	@GetMapping("/{applicationId}/portfolios")
	public BaseResponse<PortfolioFileItem> findApplicationPortfolio(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@PathVariable Long applicationId
	) {
		return BaseResponse.ok(jobService.findApplicationPortfolio(principal.userId(), applicationId));
	}
}
