package woorifisa.project.gateway.global.response.status;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseExceptionResponseStatus implements ResponseStatus {

	SUCCESS("20000", "요청에 성공했습니다."),
	BAD_REQUEST("40000", "유효하지 않은 요청입니다."),
	NOT_FOUND("40400", "존재하지 않는 API입니다."),
	INTERNAL_SERVER_ERROR("50000", "서버 내부 오류입니다."),

	GOVERNMENT_IDENTITY_REQUEST_INVALID("GOV-400", "식별번호 해시는 필수입니다."),
	GOVERNMENT_IDENTITY_NOT_FOUND("GOV-404", "정부 DB에서 신원 정보를 찾을 수 없습니다."),
	REGISTRATION_NUMBER_HMAC_SECRET_NOT_CONFIGURED("GOV-500", "식별번호 HMAC 설정이 필요합니다.");

	private final boolean success = false;
	private final String code;
	private final String message;

	@Override
	public boolean getSuccess() {
		return success;
	}

	@Override
	public String getCode() {
		return code;
	}

	@Override
	public String getMessage() {
		return message;
	}
}
