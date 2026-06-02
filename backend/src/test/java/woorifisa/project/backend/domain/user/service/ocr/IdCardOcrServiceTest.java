package woorifisa.project.backend.domain.user.service.ocr;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.ID_CARD_OCR_INVALID_ID_TYPE;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import woorifisa.project.backend.domain.user.dto.response.ocr.IdCardOcrResponse;
import woorifisa.project.backend.global.config.KycPassportOcrProperties;
import woorifisa.project.backend.global.exception.CustomException;

class IdCardOcrServiceTest {

	@Test
	@DisplayName("신분증 OCR 성공 시 이름/주민번호/발급일자를 반환한다")
	void recognizeIdCardSuccess() {
		RestClient.Builder builder = RestClient.builder();
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		IdCardOcrService service = new IdCardOcrService(
			builder,
			new KycPassportOcrProperties("http://ocr.test/document/id-card", "secret")
		);
		MockMultipartFile file = new MockMultipartFile("file", "id.jpg", "image/jpeg", "img".getBytes());

		server.expect(requestTo("http://ocr.test/document/id-card"))
			.andExpect(method(POST))
			.andRespond(withSuccess("""
				{
				  "images": [
				    {
				      "inferResult": "SUCCESS",
				      "idCard": {
				        "result": {
				          "idtype": "ID Card",
				          "ic": {
				            "name": [{ "text": "홍길동" }],
				            "personalNum": [{ "text": "900101-1234567" }],
				            "issueDate": [{ "text": "2020 01 01", "formatted": { "year": "2020", "month": "01", "day": "01" } }]
				          }
				        }
				      }
				    }
				  ]
				}
				""", MediaType.APPLICATION_JSON));

		IdCardOcrResponse response = service.recognizeIdCard(file);
		assertThat(response.name()).isEqualTo("홍길동");
		assertThat(response.residentRegistrationNumber()).isEqualTo("900101-1234567");
		assertThat(response.issueDate()).isEqualTo("2020.01.01");
		server.verify();
	}

	@Test
	@DisplayName("여권 타입이 들어오면 예외를 던진다")
	void recognizeIdCardInvalidType() {
		RestClient.Builder builder = RestClient.builder();
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		IdCardOcrService service = new IdCardOcrService(
			builder,
			new KycPassportOcrProperties("http://ocr.test/document/id-card", "secret")
		);
		MockMultipartFile file = new MockMultipartFile("file", "id.jpg", "image/jpeg", "img".getBytes());

		server.expect(requestTo("http://ocr.test/document/id-card"))
			.andExpect(method(POST))
			.andRespond(withSuccess("""
				{
				  "images": [
				    {
				      "inferResult": "SUCCESS",
				      "idCard": {
				        "result": {
				          "idtype": "Passport",
				          "ic": {
				            "name": [{ "text": "홍길동" }]
				          }
				        }
				      }
				    }
				  ]
				}
				""", MediaType.APPLICATION_JSON));

		assertThatThrownBy(() -> service.recognizeIdCard(file))
			.isInstanceOfSatisfying(CustomException.class,
				exception -> assertThat(exception.getExceptionStatus()).isEqualTo(ID_CARD_OCR_INVALID_ID_TYPE));
		server.verify();
	}
}
