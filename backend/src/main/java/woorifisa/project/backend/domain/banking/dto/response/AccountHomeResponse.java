package woorifisa.project.backend.domain.banking.dto.response;

import java.util.Optional;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;

public record AccountHomeResponse(
        AccountHomeUiState uiState,
        AccountSummary account
) {
    public static AccountHomeResponse of(User user, Optional<AccountRef> accountRef) {
        CertificateStatus certificateStatus = user.getCertificateStatus();

        // 계좌가 있으면 홈 계좌 패널은 실제 계좌 요약을 표시한다.
        return accountRef
                .map(account -> new AccountHomeResponse(
                        AccountHomeUiState.HAS_ACCOUNT,
                        AccountSummary.from(account)
                ))
                // 계좌가 없을 때만 인증서 상태를 다음 행동을 안내하는 uiState로 변환한다.
                .orElseGet(() -> new AccountHomeResponse(
                        resolveUiState(certificateStatus),
                        null
                ));
    }

    private static AccountHomeUiState resolveUiState(CertificateStatus certificateStatus) {
        // 프론트는 uiState만으로 홈 CTA를 분기한다.
        return switch (certificateStatus) {
            // 인증서 미발급 (인증서 발급 필요)
            case NOT_ISSUED -> AccountHomeUiState.NEED_CERTIFICATE;
            // 인증서 발급 중
            case PENDING -> AccountHomeUiState.CERTIFICATE_ISSUING;
            // 인증서 발급 (계좌 생성 가능)
            case ISSUED -> AccountHomeUiState.READY_TO_OPEN_ACCOUNT;
        };
    }

    public record AccountSummary(
            Long accountId,
            String accountName,
            String accountNumber,
            String bankName,
            Integer balance,
            Boolean hasLimit
    ) {
        private static AccountSummary from(AccountRef accountRef) {
            // AccountSummary는 프론트 계좌 카드 렌더링에 필요한 값만 노출한다.
            return new AccountSummary(
                    accountRef.getAccountId(),
                    accountRef.getAccountName(),
                    accountRef.getAccountNumber(),
                    AccountRef.BANK_NAME,
                    accountRef.getBalance(),
                    accountRef.getHasLimit()
            );
        }
    }
}
