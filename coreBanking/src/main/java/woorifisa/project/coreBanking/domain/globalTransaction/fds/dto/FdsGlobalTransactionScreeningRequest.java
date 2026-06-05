package woorifisa.project.coreBanking.domain.globalTransaction.fds.dto;

import woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransaction;

import java.math.BigDecimal;

public record FdsGlobalTransactionScreeningRequest(
        Long globalTransactionId,
        Long customerId,
        Long accountId,
        String remitPurpose,
        String targetCountry,
        String currency,
        String remitAmount,
        String mediaryFeePayer,
        BigDecimal exchangeRate,
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
    public static FdsGlobalTransactionScreeningRequest from(GlobalTransaction globalTransaction) {
        return new FdsGlobalTransactionScreeningRequest(
                globalTransaction.getGlobalTransactionId(),
                globalTransaction.getCustomer().getCustomerId(),
                globalTransaction.getAccount().getAccountId(),
                globalTransaction.getRemitPurpose(),
                globalTransaction.getTargetCountry(),
                globalTransaction.getCurrency().name(),
                globalTransaction.getRemitAmount(),
                globalTransaction.getMediaryFeePayer().name(),
                globalTransaction.getExchangeRate(),
                globalTransaction.getKrwAmount(),
                globalTransaction.getSenderEngName(),
                globalTransaction.getSenderPhone(),
                globalTransaction.getSenderAddressDetail(),
                globalTransaction.getSenderDistrict(),
                globalTransaction.getSenderCity(),
                globalTransaction.getSenderZipCode(),
                globalTransaction.getSenderCountry(),
                globalTransaction.getReceiverEngName(),
                globalTransaction.getReceiverAddressDetail(),
                globalTransaction.getReceiverDistrict(),
                globalTransaction.getReceiverCity(),
                globalTransaction.getReceiverZipCode(),
                globalTransaction.getReceiverPhone(),
                globalTransaction.getSwiftCode(),
                globalTransaction.getReceiverAccountNum(),
                globalTransaction.getRoutingNumber(),
                globalTransaction.getBankName(),
                globalTransaction.getRemitReason()
        );
    }
}
