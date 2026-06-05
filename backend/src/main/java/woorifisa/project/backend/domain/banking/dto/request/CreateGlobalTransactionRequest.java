package woorifisa.project.backend.domain.banking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateGlobalTransactionRequest(
        @NotNull
        Long accountId,
        @NotBlank
        String remitPurpose,
        @NotBlank
        String targetCountry,
        @NotBlank
        String currency,
        @NotBlank
        String remitAmount,
        @NotBlank
        String mediaryFeePayer,
        @NotBlank
        String exchangeRate,
        @NotBlank
        String krwAmount,
        @NotBlank
        String senderEngName,
        @NotBlank
        String senderPhone,
        @NotBlank
        String senderAddressDetail,
        @NotBlank
        String senderDistrict,
        @NotBlank
        String senderCity,
        @NotBlank
        String senderZipCode,
        @NotBlank
        String senderCountry,
        @NotBlank
        String receiverEngName,
        @NotBlank
        String receiverAddressDetail,
        String receiverDistrict,
        @NotBlank
        String receiverCity,
        String receiverZipCode,
        @NotBlank
        String receiverPhone,
        @NotBlank
        String swiftCode,
        @NotBlank
        String receiverAccountNum,
        @NotBlank
        String routingNumber,
        @NotBlank
        String bankName,
        @NotBlank
        String remitReason
) {
}
