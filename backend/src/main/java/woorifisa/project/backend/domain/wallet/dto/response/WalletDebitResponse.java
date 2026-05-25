package woorifisa.project.backend.domain.wallet.dto.response;

public record WalletDebitResponse(
        Boolean success,
        String code,
        String message
) {
}
