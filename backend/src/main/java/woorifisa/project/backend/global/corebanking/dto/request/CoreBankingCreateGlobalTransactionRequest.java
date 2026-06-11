package woorifisa.project.backend.global.corebanking.dto.request;

public record CoreBankingCreateGlobalTransactionRequest(
        String externalRequestId,
        Long customerId,
        Long accountId,
        String remitPurpose,
        String targetCountry,
        String currency,
        String remitAmount,
        String mediaryFeePayer,
        String exchangeRate,
        String krwAmount,
        String senderEngName,
        String senderPhone,
        String senderAddressDetail,
        String senderDistrict,
        String senderCity,
        String senderZipCode,
        String senderCountry,
        String receiverEngName,
        String receiverAddressDetail,
        String receiverDistrict,
        String receiverCity,
        String receiverZipCode,
        String receiverPhone,
        String swiftCode,
        String receiverAccountNum,
        String routingNumber,
        String bankName,
        String remitReason
) {
}
