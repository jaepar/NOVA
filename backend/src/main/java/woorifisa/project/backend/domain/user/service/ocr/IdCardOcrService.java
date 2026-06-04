package woorifisa.project.backend.domain.user.service.ocr;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.ID_CARD_OCR_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.ID_CARD_OCR_INVALID_ID_TYPE;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.PASSPORT_OCR_FILE_REQUIRED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.PASSPORT_OCR_NOT_CONFIGURED;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.domain.user.dto.response.ocr.IdCardOcrRawResponse;
import woorifisa.project.backend.domain.user.dto.response.ocr.IdCardOcrResponse;
import woorifisa.project.backend.global.config.KycPassportOcrProperties;
import woorifisa.project.backend.global.exception.CustomException;

@Service
@Slf4j
@RequiredArgsConstructor
public class IdCardOcrService {

	private final RestClient.Builder restClientBuilder;
	private final KycPassportOcrProperties kycPassportOcrProperties;

	/**
	 * 신분증 이미지 파일을 입력받아 OCR을 수행하고, 검증에 필요한 핵심 필드를 추출합니다.
	 *
	 * @param file 신분증 이미지 파일
	 * @return 이름, 주민등록번호, 발급일자를 담은 응답 DTO
	 */
	public IdCardOcrResponse recognizeIdCard(MultipartFile file) {
		validateFile(file);
		validateConfig();

		try {
			IdCardOcrRawResponse raw = callIdCardOcr(file);
			IdCardOcrRawResponse.Image image = extractFirstImage(raw);
			IdCardOcrRawResponse.Result result = extractIdCardResult(image);
			if (!isSuccessfulIdCardRecognition(image, result)) {
				throw new CustomException(ID_CARD_OCR_INVALID_ID_TYPE);
			}

			Map<String, Object> fields = result.ic();
			if (fields == null || fields.isEmpty()) {
				throw new CustomException(ID_CARD_OCR_FAILED);
			}

			String name = getData(fields, "name");
			String residentRegistrationNumber = getData(fields, "personalNum");
			String issueDate = getData(fields, "issueDate");
			if (name == null || residentRegistrationNumber == null || issueDate == null) {
				throw new CustomException(ID_CARD_OCR_FAILED);
			}

			return new IdCardOcrResponse(name, residentRegistrationNumber, issueDate);
		} catch (CustomException exception) {
			throw exception;
		} catch (Exception exception) {
			log.warn("id card ocr parsing failed. reason={}", exception.getMessage(), exception);
			throw new CustomException(ID_CARD_OCR_FAILED);
		}
	}

	/**
	 * 외부 OCR API를 multipart/form-data 형식으로 호출합니다.
	 *
	 * @param file OCR 처리 대상 파일
	 * @return 외부 OCR 원본 응답 DTO
	 */
	private IdCardOcrRawResponse callIdCardOcr(MultipartFile file) {
		String message = buildMessageJson();

		MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
		formData.add("message", message);
		formData.add("file", new ByteArrayResource(toBytes(file)) {
			@Override
			public String getFilename() {
				return file.getOriginalFilename() == null ? "id-card.jpg" : file.getOriginalFilename();
			}
		});

		RestClient restClient = restClientBuilder.build();
		IdCardOcrRawResponse response = restClient.post()
			.uri(kycPassportOcrProperties.url())
			.contentType(MediaType.MULTIPART_FORM_DATA)
			.header("X-OCR-SECRET", kycPassportOcrProperties.secret())
			.body(formData)
			.retrieve()
			.body(IdCardOcrRawResponse.class);

		if (response == null) {
			throw new CustomException(ID_CARD_OCR_FAILED);
		}
		return response;
	}

	/**
	 * OCR API 요청에 필요한 message 파트를 JSON 문자열로 생성합니다.
	 *
	 * @return OCR 요청용 message JSON 문자열
	 */
	private String buildMessageJson() {
		String requestId = UUID.randomUUID().toString();
		long timestamp = System.currentTimeMillis();
		return "{\"version\":\"V2\",\"requestId\":\""
			+ requestId
			+ "\",\"timestamp\":"
			+ timestamp
			+ ",\"images\":[{\"format\":\"jpg\",\"name\":\"id-card\"}]}";
	}

	/**
	 * MultipartFile을 바이트 배열로 변환합니다.
	 *
	 * @param file 변환 대상 파일
	 * @return 파일 바이트 배열
	 */
	private byte[] toBytes(MultipartFile file) {
		try {
			return file.getBytes();
		} catch (Exception exception) {
			log.warn("id card ocr file to bytes failed. filename={}, reason={}",
				file.getOriginalFilename(), exception.getMessage(), exception);
			throw new CustomException(ID_CARD_OCR_FAILED);
		}
	}

	/**
	 * OCR 결과 맵에서 후보 키 순서대로 값을 탐색해 첫 번째 유효값을 반환합니다.
	 *
	 * @param values OCR 결과 필드 맵
	 * @param keys 탐색할 키 후보들
	 * @return 파싱된 문자열 값, 없으면 null
	 */
	private String getData(Map<String, Object> values, String... keys) {
		for (String key : keys) {
			Object value = values.get(key);
			String parsed = parseValue(value);
			if (parsed != null && !parsed.isBlank()) {
				return parsed;
			}
		}
		return null;
	}

	/**
	 * OCR 단일 필드 값을 문자열로 파싱합니다.
	 * 값은 List<Map> 형태를 가정하며, formatted.value -> formatted(날짜) -> text 순서로 우선 처리합니다.
	 *
	 * @param value OCR 단일 필드 값
	 * @return 파싱된 문자열 값, 없으면 null
	 */
	private String parseValue(Object value) {
		if (!(value instanceof List<?> list) || list.isEmpty()) {
			return null;
		}
		Object first = list.getFirst();
		if (!(first instanceof Map<?, ?> data)) {
			return null;
		}

		Object formattedData = data.get("formatted");
		if (formattedData instanceof Map<?, ?> formatted) {
			Object formattedValue = formatted.get("value");
			if (formattedValue != null) {
				return String.valueOf(formattedValue);
			}
			String formattedDate = formatDate(formatted);
			if (formattedDate != null) {
				return formattedDate;
			}
		}

		Object text = data.get("text");
		return text == null ? null : String.valueOf(text);
	}

	/**
	 * OCR formatted 날짜(year/month/day)를 yyyy.MM.dd 형태 문자열로 변환합니다.
	 *
	 * @param formatted formatted 맵
	 * @return 변환된 날짜 문자열, 일부 값이 없으면 null
	 */
	private String formatDate(Map<?, ?> formatted) {
		Object year = formatted.get("year");
		Object month = formatted.get("month");
		Object day = formatted.get("day");
		if (year == null || month == null || day == null) {
			return null;
		}
		return year + "." + month + "." + day;
	}

	/**
	 * OCR 원본 응답에서 첫 번째 이미지를 추출합니다.
	 *
	 * @param raw OCR 원본 응답
	 * @return 첫 번째 이미지
	 */
	private IdCardOcrRawResponse.Image extractFirstImage(IdCardOcrRawResponse raw) {
		if (raw == null || raw.images() == null || raw.images().isEmpty()) {
			throw new CustomException(ID_CARD_OCR_FAILED);
		}
		return raw.images().getFirst();
	}

	/**
	 * OCR 이미지 결과에서 idCard/result 블록을 추출합니다.
	 *
	 * @param image OCR 이미지 결과
	 * @return idCard 결과 객체
	 */
	private IdCardOcrRawResponse.Result extractIdCardResult(IdCardOcrRawResponse.Image image) {
		if (image.idCard() == null || image.idCard().result() == null) {
			throw new CustomException(ID_CARD_OCR_FAILED);
		}
		return image.idCard().result();
	}

	/**
	 * OCR 성공 조건을 검사합니다.
	 * - inferResult 가 SUCCESS
	 * - idtype 이 Passport가 아님(신분증 경로)
	 *
	 * @param image OCR 이미지 결과
	 * @param result OCR idCard 결과
	 * @return 성공 조건 충족 여부
	 */
	private boolean isSuccessfulIdCardRecognition(IdCardOcrRawResponse.Image image, IdCardOcrRawResponse.Result result) {
		boolean isSuccess = "SUCCESS".equalsIgnoreCase(image.inferResult());
		boolean isNotPassportType = !"Passport".equalsIgnoreCase(result.idtype());
		return isSuccess && isNotPassportType;
	}

	/**
	 * OCR 요청 파일의 유효성을 검증합니다.
	 *
	 * @param file 업로드 파일
	 */
	private void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new CustomException(PASSPORT_OCR_FILE_REQUIRED);
		}
	}

	/**
	 * OCR 연동 필수 설정(URL/SECRET) 존재 여부를 검증합니다.
	 */
	private void validateConfig() {
		if (!hasText(kycPassportOcrProperties.url()) || !hasText(kycPassportOcrProperties.secret())) {
			throw new CustomException(PASSPORT_OCR_NOT_CONFIGURED);
		}
	}

	/**
	 * 문자열이 null/blank가 아닌지 확인합니다.
	 *
	 * @param value 검사 문자열
	 * @return 유효 문자열 여부
	 */
	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
