package woorifisa.project.backend.domain.job.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import woorifisa.project.backend.domain.job.dto.request.ApplicationCreateRequest;
import woorifisa.project.backend.domain.job.dto.response.ApplicationFormResponse;
import woorifisa.project.backend.domain.job.dto.response.ApplicationListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningResponse;
import woorifisa.project.backend.domain.job.dto.response.PortfolioFileResponse;
import woorifisa.project.backend.domain.job.service.JobService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/jobs")
public class JobController {

	private final JobService jobService;

	// 구인구직 공고 목록 조회
	@GetMapping
	public BaseResponse<JobOpeningListResponse> findJobOpenings(
		@RequestParam(defaultValue = "ko") String language,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return BaseResponse.ok(jobService.getJobOpeningList(language, pageable));
	}

	// 구인구직 공고 상세 조회
	@GetMapping("/{jobId}")
	public BaseResponse<JobOpeningResponse> findJobOpening(
		@PathVariable Long jobId,
		@RequestParam(defaultValue = "ko") String language
	) {
		return BaseResponse.ok(jobService.getJobOpeningDetail(jobId, language));
	}

	// 지원하기 화면 진입 시 로그인 사용자 정보와 기존 등록 포트폴리오를 한 번에 내려준다.
	@GetMapping("/applications/form")
	public BaseResponse<ApplicationFormResponse> getApplicationForm(
		@AuthenticationPrincipal SessionUserPrincipal principal
	) {
		return BaseResponse.ok(jobService.getApplicationForm(principal.userId()));
	}

	// 지원 내역 목록 조회
	@GetMapping("/applications")
	public BaseResponse<ApplicationListResponse> findApplications(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@RequestParam(defaultValue = "ko") String language,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return BaseResponse.ok(jobService.findApplications(principal.userId(), language, pageable));
	}

	// 지원 내역 상세 조회
	@GetMapping("/applications/{applicationId}/portfolios")
	public BaseResponse<List<PortfolioFileResponse>> findApplicationPortfolio(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@PathVariable Long applicationId
	) {
		return BaseResponse.ok(jobService.findApplicationPortfolio(principal.userId(), applicationId));
	}

	// 지원서 제출은 세션 사용자 기준으로 생성하므로 이름/이메일 입력값은 받지 않는다.
	@PostMapping(value = "/{jobId}/applications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public BaseResponse<Void> createApplication(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@PathVariable Long jobId,
		@RequestPart(value = "body", required = false) ApplicationCreateRequest request,
		@RequestPart(value = "files", required = false) List<MultipartFile> files
	) {
		jobService.createApplication(principal.userId(), jobId, request, files);
		return BaseResponse.ok(null);
	}
}
