package woorifisa.project.backend.global.government.client;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.GOVERNMENT_DB_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.GOVERNMENT_IDENTITY_NOT_FOUND;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.government.client.request.GovermentIdentityLookupRequest;
import woorifisa.project.backend.global.government.client.response.GovermentIdentityResponse;
import woorifisa.project.backend.global.response.BaseResponse;

@Component
@Slf4j
@RequiredArgsConstructor
public class RestGovernmentIdentityClient implements GovernmentIdentityClient {

	private final RestClient.Builder restClientBuilder;

	@Value("${app.government.base-url}")
	private String governmentBaseUrl;

	@Override
	public GovermentIdentityResponse lookupByRegistrationNumberHash(String registrationNumberHash) {
		try {
			BaseResponse<GovermentIdentityResponse> response = restClientBuilder
				.baseUrl(governmentBaseUrl)
				.build()
				.post()
				.uri("/government-identities/lookup")
				.body(new GovermentIdentityLookupRequest(registrationNumberHash))
				.retrieve()
				.body(new ParameterizedTypeReference<>() {
				});

			if (response == null || response.getData() == null) {
				throw new CustomException(GOVERNMENT_IDENTITY_NOT_FOUND);
			}
			return response.getData();
		} catch (RestClientResponseException exception) {
			if (exception.getStatusCode().is4xxClientError()) {
				throw new CustomException(GOVERNMENT_IDENTITY_NOT_FOUND);
			}
			log.warn("[government_identity:lookup_failed] status={}, reason={}",
				exception.getStatusCode(), exception.getMessage(), exception);
			throw new CustomException(GOVERNMENT_DB_COMMUNICATION_FAILED);
		} catch (RestClientException exception) {
			log.warn("[government_identity:lookup_failed] reason={}", exception.getMessage(), exception);
			throw new CustomException(GOVERNMENT_DB_COMMUNICATION_FAILED);
		}
	}
}
