package woorifisa.project.coreBanking.domain.globalTransaction.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.CurrencyCode;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.MediaryFeePayer;

import java.math.BigDecimal;

public record CreateGlobalTransactionRequest(
        @NotBlank String externalRequestId,
        @NotNull Long customerId,
        @NotNull Long accountId,
        @NotBlank String remitPurpose,
        @NotBlank String targetCountry,
        @NotNull CurrencyCode currency,
        @NotBlank String remitAmount,
        @NotNull MediaryFeePayer mediaryFeePayer,
        @NotNull BigDecimal exchangeRate,
        @NotBlank String krwAmount,
        @NotBlank String senderEngName,
        @NotBlank String senderPhone,
        @NotBlank String senderAddressDetail,
        @NotBlank String senderDistrict,
        @NotBlank String senderCity,
        @NotBlank String senderZipCode,
        @NotBlank String senderCountry,
        @NotBlank String receiverEngName,
        @NotBlank String receiverAddressDetail,
        String receiverDistrict,
        @NotBlank String receiverCity,
        String receiverZipCode,
        @NotBlank String receiverPhone,
        @NotBlank String swiftCode,
        @NotBlank String receiverAccountNum,
        @NotBlank String routingNumber,
        @NotBlank String bankName,
        @NotBlank String remitReason
) {
}
