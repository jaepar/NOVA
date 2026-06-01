package woorifisa.project.backend.global.response.status;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseExceptionResponseStatus implements ResponseStatus {

	SUCCESS("20000", "요청에 성공했습니다."),
	BAD_REQUEST("40000", "유효하지 않은 요청입니다."),
	NOT_FOUND("40400", "존재하지 않는 API입니다."),
	INTERNAL_SERVER_ERROR("50000", "서버 내부 오류입니다."),

	/**
	 * auth
	 */
	INVALID_PASSWORD_FORMAT("AUTH-001", "비밀번호는 영문+숫자+특수문자를 포함한 8~16자여야 합니다."),
	PASSWORD_CONFIRM_NOT_MATCHED("AUTH-002", "비밀번호와 비밀번호 확인이 일치하지 않습니다."),
	DUPLICATE_EMAIL("AUTH-003", "이미 가입된 이메일입니다."),
	EMAIL_NOT_FOUND("AUTH-004", "존재하지 않는 이메일입니다."),
	DELETED_USER("AUTH-005", "탈퇴한 사용자입니다."),
	PASSWORD_NOT_MATCHED("AUTH-006", "비밀번호가 일치하지 않습니다."),
	INVALID_EMAIL_FORMAT("AUTH-007", "올바른 이메일 형식이 아닙니다."),
	EMAIL_VERIFICATION_RESEND_TOO_EARLY("AUTH-008", "인증번호 재발송은 60초 후에 가능합니다."),
	EMAIL_VERIFICATION_SEND_FAILED("AUTH-009", "인증번호 이메일 발송에 실패했습니다."),
	EMAIL_VERIFICATION_CODE_EXPIRED_OR_NOT_FOUND("AUTH-010", "인증번호가 만료되었거나 존재하지 않습니다."),
	EMAIL_VERIFICATION_CODE_NOT_MATCHED("AUTH-011", "인증번호가 일치하지 않습니다."),
	UNAUTHORIZED_SESSION("AUTH-012", "로그인 세션이 유효하지 않습니다."),

	/**
	 * wallet
	 */
	WALLET_INVALID_CHARGE_AMOUNT("WALLET_CHARGE-001", "월렛 충전 금액이 올바르지 않습니다."),
	WALLET_NOT_FOUND("WALLET_CHARGE-002", "월렛을 찾을 수 없습니다."),
	WALLET_ACCOUNT_NOT_FOUND("WALLET_CHARGE-003", "출금 계좌를 찾을 수 없습니다."),
	WALLET_DEBIT_FAILED("WALLET_CHARGE-004", "계좌 차감에 실패했습니다."),
	WALLET_CHARGE_IN_PROGRESS("WALLET_CHARGE-005", "월렛 충전 요청이 처리 중입니다."),
	WALLET_IDEMPOTENCY_KEY_REQUIRED("WALLET_CHARGE-006", "Idempotency-Key가 필요합니다."),
	WALLET_DEBIT_COMMUNICATION_FAILED("WALLET_CHARGE-007", "코어뱅킹 통신에 실패했습니다."),
	WALLET_DEBIT_LOOKUP_RETRY_INTERRUPTED("WALLET_CHARGE-008", "결과 확인 재시도 대기 중 인터럽트가 발생했습니다."),
	WALLET_INSUFFICIENT_BALANCE("WALLET_CHARGE-009", "계좌 잔액이 부족합니다."),
	WALLET_TERMS_REQUIRED("WALLET-010", "월렛 약관 동의가 필요합니다."),
	WALLET_ALREADY_EXISTS("WALLET-011", "이미 월렛을 보유하고 있습니다."),
	WALLET_CREATE_FAILED("WALLET-012", "월렛 생성에 실패했습니다."),
	INVALID_PAGE_PARAM("WALLET-013", "page는 0 이상이어야 합니다."),
	INVALID_SIZE_PARAM("WALLET-014", "size는 1 이상 100 이하이어야 합니다."),

	/**
	 * user
	 */
	USER_NOT_FOUND("USER-001", "사용자 정보를 찾을 수 없습니다."),
	INVALID_DOCUMENT_FILE("USER-002", "PDF 파일만 업로드할 수 있습니다."),
	DOCUMENT_UPLOAD_FAILED("USER-003", "문서 업로드에 실패했습니다."),
	DOCUMENT_DELETE_FAILED("USER-004", "문서 삭제에 실패했습니다."),
	INITIAL_DOCUMENT_BOTH_REQUIRED("USER-005", "최초 업로드 시 두 개의 문서를 모두 제출해야 합니다."),
	REUPLOAD_ONLY_REJECTED_ALLOWED("USER-006", "보완 업로드는 반려된 문서만 제출할 수 있습니다."),
	REUPLOAD_TARGET_REQUIRED("USER-007", "보완 업로드할 반려 문서 파일이 필요합니다."),
	REUPLOAD_ALL_REJECTED_REQUIRED("USER-008", "두 문서가 모두 반려된 경우 두 개의 문서를 모두 제출해야 합니다."),
	PASSPORT_OCR_FILE_REQUIRED("USER-009", "여권 OCR을 위한 이미지 파일이 필요합니다."),
	PASSPORT_OCR_NOT_CONFIGURED("USER-010", "여권 OCR 설정이 필요합니다."),
	KYC_OUTPUT_BUCKET_NOT_CONFIGURED("USER-011", "KYC Liveness S3 버킷 설정이 필요합니다."),
	LIVENESS_REFERENCE_IMAGE_NOT_FOUND("USER-012", "Liveness 결과에서 참조 이미지를 찾을 수 없습니다."),
	PASSPORT_OCR_FAILED("USER-013", "여권 OCR 처리에 실패했습니다."),
	PASSPORT_OCR_INVALID_ID_TYPE("USER-014", "사진이 올바르지 않습니다."),
	USER_CERTIFICATE_STATUS_TRANSITION_INVALID("USER-015", "인증서 상태 전이가 올바르지 않습니다."),

	/**
	 * admin
	 */
	DOCUMENT_NOT_FOUND("ADMIN-001", "심사 대상 문서를 찾을 수 없습니다."),
	INVALID_DOCUMENT_TYPE("ADMIN-002", "유효하지 않은 문서 타입입니다."),
	INVALID_DOCUMENT_REVIEW_STATUS("ADMIN-003", "유효하지 않은 서류 심사 상태입니다."),
	DOCUMENT_REVIEW_SOURCE_STATUS_INVALID("ADMIN-004", "심사 가능한 문서 상태가 아닙니다."),

    /**
     * banking
     */
    BANKING_ACCOUNT_NOT_FOUND("BANK-001", "계좌 정보를 찾을 수 없습니다."),
    BANKING_TRANSFER_PROCESSING("BANK-002", "이미 처리 중인 이체 요청입니다."),
    BANKING_CORE_BANKING_COMMUNICATION_FAILED("BANK-003", "코어뱅킹 통신에 실패했습니다."),
    BANKING_TRANSFER_FAILED("BANK-004", "계좌 이체 처리에 실패했습니다."),
    BANKING_REQUEST_LOOKUP_RETRY_INTERRUPTED("BANK-005", "이체 처리 확인 재시도 대기 중 인터럽트가 발생했습니다."),
    BANKING_RECIPIENT_NOT_FOUND("BANK-006", "수취인 계좌 정보를 찾을 수 없습니다."),
    BANKING_ACCOUNT_PASSWORD_NOT_MATCHED("BANK-007", "계좌 비밀번호가 일치하지 않습니다."),
    BANKING_CERTIFICATE_REQUIRED("BANK-008", "인증서 발급 완료 상태에서만 계좌 개설이 가능합니다.")
    ;

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
