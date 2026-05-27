package woorifisa.project.backend.domain.banking.dto.corebanking.request;

import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;

public record CoreBankingTransferRequest(
        String externalRequestId,
        String withdrawAccountNumber,
        Long depositAccountId,
        Integer transferAmount,
        String withdrawMemo,
        String depositMemo
) {
    public static CoreBankingTransferRequest of(String externalRequestId, String withdrawAccountNumber, TransferRequest request) {
        return new CoreBankingTransferRequest(
                externalRequestId,
                withdrawAccountNumber,
                request.depositAccountId(),
                request.transferAmount(),
                request.withdrawMemo(),
                request.depositMemo()
        );
    }
}
