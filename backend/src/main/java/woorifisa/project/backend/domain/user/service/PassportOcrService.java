// 파일: backend/src/main/java/woorifisa/project/backend/domain/user/service/PassportOcrService.java
package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.util.ArrayList;
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
import woorifisa.project.backend.domain.user.dto.response.PassportOcrFieldResponse;
import woorifisa.project.backend.domain.user.dto.response.PassportOcrRawResponse;
import woorifisa.project.backend.domain.user.dto.response.PassportOcrResponse;
import woorifisa.project.backend.global.config.KycPassportOcrProperties;
import woorifisa.project.backend.global.exception.CustomException;

// 여권 OCR 외부 연동을 담당하는 서비스
@Service
@Slf4j
@RequiredArgsConstructor
public class PassportOcrService {

	private final RestClient.Builder restClientBuilder;
	private final KycPassportOcrProperties kycPassportOcrProperties;

	// 여권 이미지를 OCR 호출 후 정규화된 응답으로 변환
	public PassportOcrResponse recognizePassport(MultipartFile file) {
		validateFile(file);
		validateConfig();

		try {
			PassportOcrRawResponse raw = callPassportOcr(file);
			List<PassportOcrFieldResponse> genericFields = extractGenericFields(raw);
			List<PassportOcrFieldResponse> structuredFields = extractStructuredFields(raw);
			List<PassportOcrFieldResponse> fields = new ArrayList<>(genericFields.size() + structuredFields.size());
			fields.addAll(genericFields);
			fields.addAll(structuredFields);

			boolean success = false;
			PassportOcrRawResponse.Image image = firstImage(raw);
			if (image != null && "SUCCESS".equals(image.inferResult())) {
				success = true;
			}

			return new PassportOcrResponse(success, fields, raw);
		} catch (CustomException exception) {
			throw exception;
		} catch (Exception exception) {
			log.warn("passport ocr failed. reason={}", exception.getMessage(), exception);
			throw new CustomException(PASSPORT_OCR_FAILED);
		}
	}

	// OCR API를 multipart/form-data로 호출
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

	// OCR 요청 message(JSON 문자열) 생성
	private String buildMessageJson() {
		String requestId = UUID.randomUUID().toString();
		long timestamp = System.currentTimeMillis();
		return "{\"version\":\"V2\",\"requestId\":\""
			+ requestId
			+ "\",\"timestamp\":"
			+ timestamp
			+ ",\"images\":[{\"format\":\"jpg\",\"name\":\"passport\"}]}";
	}

	// MultipartFile 바이트 변환 실패 시 OCR 실패로 처리
	private byte[] toBytes(MultipartFile file) {
		try {
			return file.getBytes();
		} catch (Exception exception) {
			throw new CustomException(PASSPORT_OCR_FAILED);
		}
	}

	// images[0].fields 기반 일반 필드 추출
	private List<PassportOcrFieldResponse> extractGenericFields(PassportOcrRawResponse raw) {
		List<PassportOcrFieldResponse> fields = new ArrayList<>();
		PassportOcrRawResponse.Image image = firstImage(raw);
		if (image == null || image.fields() == null) {
			return fields;
		}

		for (PassportOcrRawResponse.Field field : image.fields()) {
			if (field == null) {
				continue;
			}
			fields.add(new PassportOcrFieldResponse(
				orEmpty(field.name()),
				orEmpty(field.inferText()),
				field.inferConfidence()
			));
		}
		return fields;
	}

	// idCard/passportResult 기반 구조화 필드 추출
	private List<PassportOcrFieldResponse> extractStructuredFields(PassportOcrRawResponse raw) {
		List<PassportOcrFieldResponse> fields = new ArrayList<>();
		PassportOcrRawResponse.Image image = firstImage(raw);
		if (image == null) {
			return fields;
		}

		Map<String, Object> pp = extractPp(image.idCard());
		if (pp != null) {
			pushField(fields, "doc_type", pp.get("type"));
			pushField(fields, "nationality_code", pp.get("issueCountry"));
			pushField(fields, "passport_number", pp.get("num"));
			pushField(fields, "surname", pp.get("surName"));
			pushField(fields, "given_name", pp.get("givenName"));
			pushField(fields, "birth_date", pp.get("birthDate"));
			pushField(fields, "sex", pp.get("sex"));
			pushField(fields, "nationality", pp.get("nationality"));
			pushField(fields, "authority", pp.get("authority"));
			pushField(fields, "issue_date", pp.get("issueDate"));
			pushField(fields, "expiry_date", pp.get("expireDate"));
		}

		Map<String, Object> passportResult = extractPassportResult(image.passport());
		if (passportResult != null) {
			pushField(fields, "doc_type", firstNonNull(passportResult.get("documentType"), passportResult.get("type")));
			pushField(fields, "nationality_code", firstNonNull(
				passportResult.get("issuingState"),
				passportResult.get("countryCode"),
				passportResult.get("nationalityCode")
			));
			pushField(fields, "passport_number", firstNonNull(
				passportResult.get("passportNumber"),
				passportResult.get("documentNumber")
			));
			pushField(fields, "surname", firstNonNull(passportResult.get("surname"), passportResult.get("lastName")));
			pushField(fields, "given_name",
				firstNonNull(passportResult.get("givenNames"), passportResult.get("firstName")));
			pushField(fields, "birth_date",
				firstNonNull(passportResult.get("dateOfBirth"), passportResult.get("birthDate")));
			pushField(fields, "sex", firstNonNull(passportResult.get("sex"), passportResult.get("gender")));
			pushField(fields, "nationality", passportResult.get("nationality"));
			pushField(fields, "issue_date", passportResult.get("issueDate"));
			pushField(fields, "expiry_date", firstNonNull(
				passportResult.get("dateOfExpiry"),
				passportResult.get("expiryDate")
			));
		}

		return fields;
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> extractPp(Map<String, Object> idCard) {
		if (idCard == null) {
			return null;
		}
		Object result = idCard.get("result");
		if (!(result instanceof Map<?, ?> resultMap)) {
			return null;
		}
		Object pp = resultMap.get("pp");
		return pp instanceof Map<?, ?> ? (Map<String, Object>)pp : null;
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> extractPassportResult(Map<String, Object> passport) {
		if (passport == null) {
			return null;
		}
		Object passportResult = passport.get("passportResult");
		return passportResult instanceof Map<?, ?> ? (Map<String, Object>)passportResult : null;
	}

	private void pushField(List<PassportOcrFieldResponse> target, String name, Object value) {
		OcrExtractedValue extracted = getFirstValueWithConfidence(value);
		if (extracted == null) {
			return;
		}
		target.add(new PassportOcrFieldResponse(name, extracted.text(), extracted.confidence()));
	}

	@SuppressWarnings("unchecked")
	private OcrExtractedValue getFirstValueWithConfidence(Object value) {
		if (value == null) {
			return null;
		}

		if (value instanceof String text) {
			String normalized = text.trim();
			return normalized.isEmpty() ? null : new OcrExtractedValue(normalized, null);
		}

		if (value instanceof List<?> list) {
			for (Object item : list) {
				if (item instanceof Map<?, ?> mapItem) {
					OcrExtractedValue extracted = extractFromCandidate((Map<String, Object>)mapItem);
					if (extracted != null) {
						return extracted;
					}
				}
			}
		}

		if (value instanceof Map<?, ?> mapValue) {
			return extractFromCandidate((Map<String, Object>)mapValue);
		}

		return null;
	}

	@SuppressWarnings("unchecked")
	private OcrExtractedValue extractFromCandidate(Map<String, Object> candidate) {
		Object formattedObj = candidate.get("formatted");
		if (formattedObj instanceof Map<?, ?> formattedMapRaw) {
			Map<String, Object> formattedMap = (Map<String, Object>)formattedMapRaw;
			String formattedValue = asTrimmedString(formattedMap.get("value"));
			if (!formattedValue.isEmpty()) {
				return new OcrExtractedValue(formattedValue, asFloat(candidate.get("confidenceScore")));
			}

			String year = asTrimmedString(formattedMap.get("year"));
			String month = asTrimmedString(formattedMap.get("month"));
			String day = asTrimmedString(formattedMap.get("day"));
			if (!year.isEmpty() && !month.isEmpty() && !day.isEmpty()) {
				return new OcrExtractedValue(year + "." + month + "." + day, asFloat(candidate.get("confidenceScore")));
			}
		}

		String text = asTrimmedString(candidate.get("text"));
		if (!text.isEmpty()) {
			return new OcrExtractedValue(text, asFloat(candidate.get("confidenceScore")));
		}

		return null;
	}

	private Object firstNonNull(Object... values) {
		for (Object value : values) {
			if (value != null) {
				return value;
			}
		}
		return null;
	}

	private String asTrimmedString(Object value) {
		if (value == null) {
			return "";
		}
		return String.valueOf(value).trim();
	}

	private Float asFloat(Object value) {
		if (value instanceof Number number) {
			return number.floatValue();
		}
		return null;
	}

	private PassportOcrRawResponse.Image firstImage(PassportOcrRawResponse raw) {
		if (raw == null || raw.images() == null || raw.images().isEmpty()) {
			return null;
		}
		return raw.images().get(0);
	}

	private String orEmpty(String value) {
		return value == null ? "" : value;
	}

	private void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new CustomException(PASSPORT_OCR_FILE_REQUIRED);
		}
	}

	private void validateConfig() {
		if (!hasText(kycPassportOcrProperties.url()) || !hasText(kycPassportOcrProperties.secret())) {
			throw new CustomException(PASSPORT_OCR_NOT_CONFIGURED);
		}
	}

	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}

	private record OcrExtractedValue(String text, Float confidence) {
	}
}