package woorifisa.project.backend.global.corebanking.dto.response;

public record CoreBankingBaseResponse<T>(
        boolean success,
        String code,
        String message,
        T data
) {
}
