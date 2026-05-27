package woorifisa.project.backend.domain.banking.dto.corebanking.request;

import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;

public record CoreBankingTransferRequest(
        String externalRequestId,
        Long withdrawAccountId,
        Long depositAccountId,
        Integer transferAmount,
        String withdrawMemo,
        String depositMemo
) {
    public static CoreBankingTransferRequest of(String externalRequestId, Long withdrawAccountId, TransferRequest request) {
        return new CoreBankingTransferRequest(
                externalRequestId,
                withdrawAccountId,
                request.depositAccountId(),
                request.transferAmount(),
                request.withdrawMemo(),
                request.depositMemo()
        );
    }
}
