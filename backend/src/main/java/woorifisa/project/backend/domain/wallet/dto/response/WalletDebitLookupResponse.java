package woorifisa.project.backend.domain.wallet.dto.response;

public record WalletDebitLookupResponse(
        Boolean success,
        String code,
        String message,
        WalletDebitLookupData data
) {
}
