package woorifisa.project.backend.global.corebanking.client.response;

public record CoreBankingBaseErrorResponse<T>(
        boolean success,
        String code,
        String message,
        T data
) {
}
