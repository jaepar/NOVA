package woorifisa.project.backend.domain.wallet.dto.corebanking.response;

public record CoreBankingBaseResponse<T>(
        boolean success,
        String code,
        String message,
        T data
) {
}
