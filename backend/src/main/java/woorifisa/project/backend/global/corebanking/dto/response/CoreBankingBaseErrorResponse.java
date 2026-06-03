package woorifisa.project.backend.global.corebanking.dto.response;

public record CoreBankingBaseErrorResponse<T>(
        boolean success,
        String code,
        String message,
        T data
) {
}
