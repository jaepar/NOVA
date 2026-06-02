package woorifisa.project.gateway.domain.foreigner.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.gateway.domain.foreigner.dto.GovernmentIdentityLookupRequest;
import woorifisa.project.gateway.domain.foreigner.dto.GovernmentIdentityResponse;
import woorifisa.project.gateway.domain.foreigner.entity.Foreigner;
import woorifisa.project.gateway.domain.foreigner.repository.ForeignerRepository;
import woorifisa.project.gateway.global.exception.CustomException;

import static woorifisa.project.gateway.global.response.status.BaseExceptionResponseStatus.GOVERNMENT_IDENTITY_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class ForeignerService {

	private final ForeignerRepository foreignerRepository;

	@Transactional(readOnly = true)
	public GovernmentIdentityResponse lookupIdentity(GovernmentIdentityLookupRequest request) {
		Foreigner foreigner = foreignerRepository.findByRegistrationNumberHash(request.registrationNumberHash())
			.orElseThrow(() -> new CustomException(GOVERNMENT_IDENTITY_NOT_FOUND));

		return GovernmentIdentityResponse.from(foreigner);
	}
}
