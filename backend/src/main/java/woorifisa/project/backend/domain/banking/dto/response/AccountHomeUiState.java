package woorifisa.project.backend.domain.banking.dto.response;

// NOVA 홈 계좌 패널의 1차 분기값. 프론트는 이 값으로 CTA/계좌 카드 화면을 선택한다.
public enum AccountHomeUiState {
    NEED_CERTIFICATE,
    CERTIFICATE_ISSUING,
    READY_TO_OPEN_ACCOUNT,
    HAS_ACCOUNT
}
