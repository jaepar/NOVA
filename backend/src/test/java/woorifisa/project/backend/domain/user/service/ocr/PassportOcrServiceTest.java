package woorifisa.project.backend.domain.user.service.ocr;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.http.HttpMethod.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import woorifisa.project.backend.domain.user.dto.response.ocr.PassportOcrResponse;
import woorifisa.project.backend.global.config.KycPassportOcrProperties;
import woorifisa.project.backend.global.exception.CustomException;

class PassportOcrServiceTest {

	@Test
	@DisplayName("OCR 성공 및 idType=Passport면 PassportResponse를 반환한다")
	void recognizePassportSuccess() {
		RestClient.Builder builder = RestClient.builder();
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		PassportOcrService service = new PassportOcrService(
			builder,
			new KycPassportOcrProperties("http://ocr.test/document/id-card", "secret")
		);
		MockMultipartFile file = new MockMultipartFile("file", "passport.jpg", "image/jpeg", "img".getBytes());

		server.expect(requestTo("http://ocr.test/document/id-card"))
			.andExpect(method(POST))
			.andRespond(withSuccess("""
				{
				  "version": "V2",
				  "requestId": "req-1",
				  "timestamp": 1780156299766,
				  "images": [
				    {
				      "inferResult": "SUCCESS",
				      "idCard": {
				        "result": {
				          "idtype": "Passport",
				          "pp": {
				            "num": [{ "text": "M12345678" }],
				            "surName": [{ "text": "KIM" }],
				            "givenName": [{ "text": "GILDONG" }],
				            "issueCountry": [{ "text": "KOR" }]
				          }
				        }
				      }
				    }
				  ]
				}
				""", MediaType.APPLICATION_JSON));

		PassportOcrResponse response = service.recognizePassport(file);

		assertThat(response.num()).isEqualTo("M12345678");
		assertThat(response.surName()).isEqualTo("KIM");
		assertThat(response.givenName()).isEqualTo("GILDONG");
		assertThat(response.issueCountry()).isEqualTo("KOR");
		server.verify();
	}

	@Test
	@DisplayName("파일이 없으면 PASSPORT_OCR_FILE_REQUIRED 예외를 던진다")
	void recognizePassportWithoutFile() {
		PassportOcrService service = new PassportOcrService(
			RestClient.builder(),
			new KycPassportOcrProperties("http://ocr.test/document/id-card", "secret")
		);

		assertThatThrownBy(() -> service.recognizePassport(null))
			.isInstanceOfSatisfying(CustomException.class,
				exception -> assertThat(exception.getExceptionStatus()).isEqualTo(PASSPORT_OCR_FILE_REQUIRED));
	}

	@Test
	@DisplayName("OCR 설정이 비어있으면 PASSPORT_OCR_NOT_CONFIGURED 예외를 던진다")
	void recognizePassportWithoutConfig() {
		PassportOcrService service = new PassportOcrService(
			RestClient.builder(),
			new KycPassportOcrProperties("", "")
		);
		MockMultipartFile file = new MockMultipartFile("file", "passport.jpg", "image/jpeg", "img".getBytes());

		assertThatThrownBy(() -> service.recognizePassport(file))
			.isInstanceOfSatisfying(CustomException.class,
				exception -> assertThat(exception.getExceptionStatus()).isEqualTo(PASSPORT_OCR_NOT_CONFIGURED));
	}

	@Test
	@DisplayName("inferResult 실패 또는 idType 불일치면 PASSPORT_OCR_INVALID_ID_TYPE 예외를 던진다")
	void recognizePassportInvalidIdType() {
		RestClient.Builder builder = RestClient.builder();
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		PassportOcrService service = new PassportOcrService(
			builder,
			new KycPassportOcrProperties("http://ocr.test/document/id-card", "secret")
		);
		MockMultipartFile file = new MockMultipartFile("file", "passport.jpg", "image/jpeg", "img".getBytes());

		server.expect(requestTo("http://ocr.test/document/id-card"))
			.andExpect(method(POST))
			.andRespond(withSuccess("""
				{
				  "images": [
				    {
				      "inferResult": "SUCCESS",
				      "idCard": {
				        "result": {
				          "idtype": "AlienCard",
				          "pp": {
				            "num": [{ "text": "M12345678" }]
				          }
				        }
				      }
				    }
				  ]
				}
				""", MediaType.APPLICATION_JSON));

		assertThatThrownBy(() -> service.recognizePassport(file))
			.isInstanceOfSatisfying(CustomException.class,
				exception -> assertThat(exception.getExceptionStatus()).isEqualTo(PASSPORT_OCR_INVALID_ID_TYPE));
		server.verify();
	}

	@Test
	@DisplayName("OCR 응답 구조가 비정상이면 PASSPORT_OCR_FAILED 예외를 던진다")
	void recognizePassportMalformedResponse() {
		RestClient.Builder builder = RestClient.builder();
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		PassportOcrService service = new PassportOcrService(
			builder,
			new KycPassportOcrProperties("http://ocr.test/document/id-card", "secret")
		);
		MockMultipartFile file = new MockMultipartFile("file", "passport.jpg", "image/jpeg", "img".getBytes());

		server.expect(requestTo("http://ocr.test/document/id-card"))
			.andExpect(method(POST))
			.andRespond(withSuccess("{\"images\":[]}", MediaType.APPLICATION_JSON));

		assertThatThrownBy(() -> service.recognizePassport(file))
			.isInstanceOfSatisfying(CustomException.class,
				exception -> assertThat(exception.getExceptionStatus()).isEqualTo(PASSPORT_OCR_FAILED));
		server.verify();
	}
}
