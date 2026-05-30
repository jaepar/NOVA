package woorifisa.project.coreBanking.global.response.status;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseResponseStatus implements ResponseStatus {
	SUCCESS("20000", "요청에 성공했습니다."),
	BAD_REQUEST("40000", "유효하지 않은 요청입니다."),
	NOT_FOUND("40400", "대상을 찾을 수 없습니다."),
	INTERNAL_SERVER_ERROR("50000", "서버 내부 오류입니다."),

	/**
	 * customer
	 */
	CUSTOMER_NOT_FOUND("CUSTOMER-001", "고객 정보를 찾을 수 없습니다."),

	/**
	 * account
	 */
	ACCOUNT_DEBIT_INVALID_AMOUNT("ACCOUNT-001", "출금 금액이 올바르지 않습니다."),
	ACCOUNT_DEBIT_INSUFFICIENT_BALANCE("ACCOUNT-002", "출금 계좌 잔액이 부족합니다."),
	ACCOUNT_CREDIT_INVALID_AMOUNT("ACCOUNT-003", "입금 금액이 올바르지 않습니다."),
	ACCOUNT_RECIPIENT_LOOKUP_INVALID_REQUEST("ACCOUNT-004", "수취인 조회 요청이 올바르지 않습니다."),
	ACCOUNT_RECIPIENT_LOOKUP_ACCOUNT_NOT_FOUND("ACCOUNT-005", "수취 계좌를 찾을 수 없습니다."),
	ACCOUNT_PASSWORD_VERIFY_ACCOUNT_NOT_FOUND("ACCOUNT-006", "계좌 정보를 찾을 수 없습니다."),
	ACCOUNT_PASSWORD_VERIFY_NOT_MATCHED("ACCOUNT-007", "계좌 비밀번호가 일치하지 않습니다."),
	ACCOUNT_CREATE_INVALID_REQUEST("ACCOUNT-008", "계좌 개설 요청이 올바르지 않습니다."),
	ACCOUNT_CREATE_CUSTOMER_NOT_FOUND("ACCOUNT-009", "고객 정보를 찾을 수 없습니다."),
	ACCOUNT_CREATE_TYPE_INVALID("ACCOUNT-010", "계좌 유형이 올바르지 않습니다."),
	ACCOUNT_CREATE_PURPOSE_INVALID("ACCOUNT-011", "거래 목적 값이 올바르지 않습니다."),
	ACCOUNT_CREATE_SOURCE_INVALID("ACCOUNT-012", "자금 출처 값이 올바르지 않습니다."),
	ACCOUNT_NUMBER_GENERATION_FAILED("ACCOUNT-013", "계좌번호 생성에 실패했습니다."),
	ACCOUNT_EXIST("ACCOUNT-014", "동일한 상품이 존재합니다."),

	/**
	 * accountTransaction
	 */
	ACCOUNT_TRANSACTION_NOT_FOUND("ACCOUNT_TRANSACTION-001", "거래 처리 내역을 찾을 수 없습니다."),
	ACCOUNT_TRANSFER_INVALID_REQUEST("ACCOUNT_TRANSFER-001", "계좌 이체 요청이 올바르지 않습니다."),
	ACCOUNT_TRANSFER_WITHDRAW_ACCOUNT_NOT_FOUND("ACCOUNT_TRANSFER-002", "출금 계좌를 찾을 수 없습니다."),
	ACCOUNT_TRANSFER_DEPOSIT_ACCOUNT_NOT_FOUND("ACCOUNT_TRANSFER-003", "입금 계좌를 찾을 수 없습니다."),
	ACCOUNT_TRANSFER_DEPOSIT_ACCOUNT_HOLDER_MISMATCH("ACCOUNT_TRANSFER-004", "입금 계좌 예금주 정보가 일치하지 않습니다."),
	ACCOUNT_TRANSFER_INSUFFICIENT_BALANCE("ACCOUNT_TRANSFER-005", "출금 계좌 잔액이 부족합니다."),
	ACCOUNT_TRANSFER_CONFLICT("ACCOUNT_TRANSFER-006", "계좌 이체 요청 처리 중 충돌이 발생했습니다."),

	/**
	 * wallet
	 */
	WALLET_ACCOUNT_DEBIT_INVALID_REQUEST("WALLET_ACCOUNT_DEBIT-001", "계좌 차감 요청이 올바르지 않습니다."),
	WALLET_ACCOUNT_DEBIT_NOT_FOUND("WALLET_ACCOUNT_DEBIT-002", "출금 계좌를 찾을 수 없습니다."),
	WALLET_ACCOUNT_DEBIT_INSUFFICIENT_BALANCE("WALLET_ACCOUNT_DEBIT-003", "계좌 잔액이 부족합니다."),
	WALLET_ACCOUNT_DEBIT_CONFLICT("WALLET_ACCOUNT_DEBIT-004", "계좌 차감 요청 처리 중 충돌이 발생했습니다.");

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
