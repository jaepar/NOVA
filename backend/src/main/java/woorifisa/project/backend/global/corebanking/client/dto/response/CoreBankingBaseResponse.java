package woorifisa.project.backend.global.corebanking.client.dto.response;

public record CoreBankingBaseResponse<T>(
        boolean success,
        String code,
        String message,
        T data
) {
}
