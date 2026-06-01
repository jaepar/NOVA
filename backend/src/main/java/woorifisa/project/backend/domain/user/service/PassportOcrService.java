package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

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
import woorifisa.project.backend.domain.user.dto.response.PassportOcrRawResponse;
import woorifisa.project.backend.domain.user.dto.response.PassportResponse;
import woorifisa.project.backend.global.config.KycPassportOcrProperties;
import woorifisa.project.backend.global.exception.CustomException;

@Service
@Slf4j
@RequiredArgsConstructor
public class PassportOcrService {

	private final RestClient.Builder restClientBuilder;
	private final KycPassportOcrProperties kycPassportOcrProperties;

	/**
	 * 여권 이미지 파일을 입력받아 OCR을 수행하고, 프론트에서 사용 가능한 응답 형태로 변환합니다.
	 *
	 * @param file 여권 이미지 파일
	 * @return OCR 성공 여부, 필드 목록, 원본 응답을 포함한 결과
	 */
	public PassportResponse recognizePassport(MultipartFile file) {
		validateFile(file);
		validateConfig();

		try {
			PassportOcrRawResponse raw = callPassportOcr(file);
			PassportOcrRawResponse.Image image = extractFirstImage(raw);
			PassportOcrRawResponse.Result idCardResult = extractIdCardResult(image);

			if (!isSuccessfulPassportRecognition(image, idCardResult)) {
				log.warn("passport ocr validation failed. inferResult={}, idType={}",
					image.inferResult(), idCardResult.idtype());
				throw new CustomException(PASSPORT_OCR_INVALID_ID_TYPE);
			}

			Map<String, Object> passport = idCardResult.pp();
			if (passport == null || passport.isEmpty()) {
				log.warn("passport ocr result is empty. requestId={}", raw.requestId());
				throw new CustomException(PASSPORT_OCR_FAILED);
			}

			return PassportResponse.builder()
				.type(getData(passport, "type"))
				.issueCountry(getData(passport, "issueCountry"))
				.num(getData(passport, "num"))
				.surName(getData(passport, "surName"))
				.givenName(getData(passport, "givenName"))
				.nationality(getData(passport, "nationality"))
				.birthDate(getData(passport, "birthDate"))
				.sex(getData(passport, "sex"))
				.issueDate(getData(passport, "issueDate"))
				.expireDate(getData(passport, "expireDate"))
				.authority(getData(passport, "authority"))
				.build();
		} catch (CustomException exception) {
			throw exception;
		} catch (Exception exception) {
			log.warn("passport ocr parsing failed. reason={}", exception.getMessage(), exception);
			throw new CustomException(PASSPORT_OCR_FAILED);
		}
	}

	/**
	 * 외부 OCR API를 multipart/form-data 형식으로 호출합니다.
	 *
	 * @param file OCR 처리 대상 파일
	 * @return 외부 OCR 원본 응답 DTO
	 */
	private PassportOcrRawResponse callPassportOcr(MultipartFile file) {
		String message = buildMessageJson();

		MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
		formData.add("message", message);
		formData.add("file", new ByteArrayResource(toBytes(file)) {
			@Override
			public String getFilename() {
				return file.getOriginalFilename() == null ? "passport.jpg" : file.getOriginalFilename();
			}
		});

		RestClient restClient = restClientBuilder.build();
		PassportOcrRawResponse response = restClient.post()
			.uri(kycPassportOcrProperties.url())
			.contentType(MediaType.MULTIPART_FORM_DATA)
			.header("X-OCR-SECRET", kycPassportOcrProperties.secret())
			.body(formData)
			.retrieve()
			.body(PassportOcrRawResponse.class);

		if (response == null) {
			throw new CustomException(PASSPORT_OCR_FAILED);
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
			+ ",\"images\":[{\"format\":\"jpg\",\"name\":\"passport\"}]}";
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
			log.warn("passport ocr file to bytes failed. filename={}, reason={}",
				file.getOriginalFilename(), exception.getMessage(), exception);
			throw new CustomException(PASSPORT_OCR_FAILED);
		}
	}

	/**
	 * OCR 결과 맵에서 키에 해당하는 값을 문자열로 추출합니다.
	 * 값은 List<Map> 형태를 가정하며, formatted.value -> formatted(날짜) -> text 순서로 우선 처리합니다.
	 *
	 * @param passport OCR passport 결과 맵
	 * @param key 추출 대상 키
	 * @return 파싱된 문자열 값, 없으면 null
	 */
	private String getData(Map<String, Object> passport, String key) {
		Object value = passport.get(key);  // List<Map>의 형태를 가짐

		if (!(value instanceof List<?> list) || list.isEmpty()) {
			return null;
		}

		Object first = list.getFirst();  // 자바 21 문법

		if (!(first instanceof Map<?, ?> data)) {
			return null;
		}

		Object formattedData = data.get("formatted");

		if (formattedData instanceof Map<?, ?> formatted) {
			Object formattedValue = formatted.get("value");

			if (formattedValue != null) {  // value가 날짜 데이터가 아닌 text와 같은 데이터라면
				return String.valueOf(formattedValue);
			}

			String formattedDate = formatDate(formatted);  // 날짜 데이터 처리

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
	private PassportOcrRawResponse.Image extractFirstImage(PassportOcrRawResponse raw) {
		if (raw == null || raw.images() == null || raw.images().isEmpty()) {
			log.warn("passport ocr raw images is empty.");
			throw new CustomException(PASSPORT_OCR_FAILED);
		}
		return raw.images().getFirst();
	}

	/**
	 * OCR 이미지 결과에서 idCard/result 블록을 추출합니다.
	 *
	 * @param image OCR 이미지 결과
	 * @return idCard 결과 객체
	 */
	private PassportOcrRawResponse.Result extractIdCardResult(PassportOcrRawResponse.Image image) {
		if (image.idCard() == null || image.idCard().result() == null) {
			log.warn("passport ocr idCard result is missing.");
			throw new CustomException(PASSPORT_OCR_FAILED);
		}
		return image.idCard().result();
	}

	/**
	 * OCR 성공 조건을 검사합니다.
	 * - inferResult 가 SUCCESS
	 * - idtype 이 Passport
	 *
	 * @param image OCR 이미지 결과
	 * @param result OCR idCard 결과
	 * @return 성공 조건 충족 여부
	 */
	private boolean isSuccessfulPassportRecognition(
		PassportOcrRawResponse.Image image,
		PassportOcrRawResponse.Result result
	) {
		boolean isSuccess = "SUCCESS".equalsIgnoreCase(image.inferResult());
		boolean isPassportType = "Passport".equalsIgnoreCase(result.idtype());
		return isSuccess && isPassportType;
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
