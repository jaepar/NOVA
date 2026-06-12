package woorifisa.project.backend.global.corebanking.dto.request;

import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;

public record CoreBankingTransferRequest(
        String externalRequestId,
        String withdrawAccountId,
        String depositAccountId,
        Integer transferAmount
) {
    public static CoreBankingTransferRequest of(String externalRequestId, String withdrawAccountId, TransferRequest request) {
        return new CoreBankingTransferRequest(
                externalRequestId,
                withdrawAccountId,
                request.depositAccountId(),
                request.transferAmount()
        );
    }
}
