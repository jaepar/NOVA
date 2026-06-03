package woorifisa.project.backend.global.government.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withResourceNotFound;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.GOVERNMENT_IDENTITY_NOT_FOUND;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.government.client.response.GovermentIdentityResponse;

class RestGovernmentIdentityClientTest {

	private static final String REGISTRATION_NUMBER_HASH =
		"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

	@Test
	@DisplayName("정부 DB 신원 조회에 성공하면 응답 데이터를 반환한다")
	void lookupByResidentRegistrationNumberSuccess() {
		RestClient.Builder builder = RestClient.builder();
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		RestGovernmentIdentityClient client = new RestGovernmentIdentityClient(builder);
		ReflectionTestUtils.setField(client, "governmentBaseUrl", "http://government.test");

		server.expect(requestTo("http://government.test/government-identities/lookup"))
			.andExpect(method(POST))
			.andRespond(withSuccess("""
				{
				  "success": true,
				  "code": "20000",
				  "message": "요청에 성공했습니다.",
				  "data": {
				    "name": "홍길동",
				    "issueDate": "2020.01.01",
				    "active": true
				  }
				}
				""", MediaType.APPLICATION_JSON));

		GovermentIdentityResponse response =
			client.lookupByRegistrationNumberHash(REGISTRATION_NUMBER_HASH);

		assertThat(response.name()).isEqualTo("홍길동");
		assertThat(response.issueDate()).isEqualTo("2020.01.01");
		assertThat(response.active()).isTrue();
		server.verify();
	}

	@Test
	@DisplayName("정부 DB에 신원 정보가 없으면 NOT_FOUND 예외를 던진다")
	void lookupByResidentRegistrationNumberNotFound() {
		RestClient.Builder builder = RestClient.builder();
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		RestGovernmentIdentityClient client = new RestGovernmentIdentityClient(builder);
		ReflectionTestUtils.setField(client, "governmentBaseUrl", "http://government.test");

		server.expect(requestTo("http://government.test/government-identities/lookup"))
			.andExpect(method(POST))
			.andExpect(content().json("""
				{
				  "registrationNumberHash": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
				}
				"""))
			.andRespond(withResourceNotFound());

		assertThatThrownBy(() -> client.lookupByRegistrationNumberHash(REGISTRATION_NUMBER_HASH))
			.isInstanceOfSatisfying(CustomException.class,
				exception -> assertThat(exception.getExceptionStatus()).isEqualTo(GOVERNMENT_IDENTITY_NOT_FOUND));
		server.verify();
	}
}
