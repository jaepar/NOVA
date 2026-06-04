package woorifisa.project.backend.domain.wallet.dto.response;

public record WalletSummaryResponse(
        Integer balance,
        String linkedAccountNumber
) {
}
