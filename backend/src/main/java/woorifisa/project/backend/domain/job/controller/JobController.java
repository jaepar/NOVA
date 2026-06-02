package woorifisa.project.backend.domain.job.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;
import woorifisa.project.backend.domain.job.dto.response.CreateApplicationResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningResponse;
import woorifisa.project.backend.domain.job.service.JobService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/jobs")
public class JobController {

	private final JobService jobService;

	@GetMapping
	public BaseResponse<JobOpeningListResponse> findJobOpenings(
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return BaseResponse.ok(jobService.getJobOpeningList(pageable));
	}

	@GetMapping("/{jobId}")
	public BaseResponse<JobOpeningResponse> findJobOpening(@PathVariable Long jobId) {
		return BaseResponse.ok(jobService.getJobOpeningDetail(jobId));
	}

	@PostMapping(value = "/{jobId}/applications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	// 그냥 공통 null 응답
	public BaseResponse<CreateApplicationResponse> createApplication(
		@AuthenticationPrincipal SessionUserPrincipal principal,
		@PathVariable Long jobId,
		@RequestParam(value = "country_code", required = false) String countryCode, // 불필요
		@RequestParam(required = false) String phone,	// 불필요
		@RequestParam(required = false) String recommender,	// 불필요
		@RequestPart(value = "files", required = false) MultipartFile[] files
	) {
		return BaseResponse.ok(jobService.createApplication(principal.userId(), jobId, countryCode, phone, recommender, files));
	}
}
