package woorifisa.project.backend.domain.banking.dto.corebanking.request;

import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;

public record CoreBankingTransferRequest(
        String externalRequestId,
        Long customerId,
        Long withdrawAccountId,
        String depositBankCode,
        String depositAccountNumber,
        String depositAccountHolderName,
        Integer transferAmount,
        String withdrawMemo,
        String depositMemo
) {
    public static CoreBankingTransferRequest of(String externalRequestId, Long customerId, TransferRequest request) {
        return new CoreBankingTransferRequest(
                externalRequestId,
                customerId,
                request.withdrawAccountId(),
                request.depositBankCode(),
                request.depositAccountNumber(),
                request.depositAccountHolderName(),
                request.transferAmount(),
                request.withdrawMemo(),
                request.depositMemo()
        );
    }
}
