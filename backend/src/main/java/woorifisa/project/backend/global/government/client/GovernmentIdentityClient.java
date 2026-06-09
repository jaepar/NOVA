package woorifisa.project.backend.global.government.client;

import woorifisa.project.backend.global.government.client.response.GovermentIdentityResponse;

public interface GovernmentIdentityClient {

	GovermentIdentityResponse lookupByRegistrationNumberHash(String registrationNumberHash);
}
