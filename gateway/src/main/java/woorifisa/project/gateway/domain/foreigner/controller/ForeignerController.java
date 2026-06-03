package woorifisa.project.gateway.domain.foreigner.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.gateway.domain.foreigner.dto.GovernmentIdentityLookupRequest;
import woorifisa.project.gateway.domain.foreigner.dto.GovernmentIdentityResponse;
import woorifisa.project.gateway.domain.foreigner.service.ForeignerService;
import woorifisa.project.gateway.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
public class ForeignerController {

	private final ForeignerService governmentIdentityService;

	@PostMapping("/government-identities/lookup")
	public BaseResponse<GovernmentIdentityResponse> lookupIdentity(
		@Valid @RequestBody GovernmentIdentityLookupRequest request
	) {
		return BaseResponse.ok(governmentIdentityService.lookupIdentity(request));
	}
}
