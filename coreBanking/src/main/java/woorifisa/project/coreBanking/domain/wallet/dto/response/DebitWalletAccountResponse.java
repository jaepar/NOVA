package woorifisa.project.coreBanking.domain.wallet.dto.response;

public record DebitWalletAccountResponse(
        Boolean success,
        Integer code,
        String message
) {
}
