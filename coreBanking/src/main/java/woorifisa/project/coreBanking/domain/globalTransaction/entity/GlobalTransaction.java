package woorifisa.project.coreBanking.domain.globalTransaction.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.CurrencyCode;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionFailureReason;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.MediaryFeePayer;
import woorifisa.project.coreBanking.global.entity.BaseEntity;

import java.math.BigDecimal;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "global_transaction")
public class GlobalTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "global_transaction_id")
    private Long globalTransactionId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "remit_purpose", length = 255)
    private String remitPurpose;

    @Column(name = "target_country", length = 100)
    private String targetCountry;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false)
    private CurrencyCode currency;

    @Column(name = "remit_amount", length = 100)
    private String remitAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "mediary_fee_payer", nullable = false)
    private MediaryFeePayer mediaryFeePayer;

    @Column(name = "exchange_rate", precision = 19, scale = 6)
    private BigDecimal exchangeRate;

    @Column(name = "krw_amount", length = 100)
    private String krwAmount;

    @Column(name = "sender_eng_name", length = 100)
    private String senderEngName;

    @Column(name = "sender_phone", length = 100)
    private String senderPhone;

    @Column(name = "sender_address_detail", length = 255)
    private String senderAddressDetail;

    @Column(name = "sender_district", length = 100)
    private String senderDistrict;

    @Column(name = "sender_city", length = 100)
    private String senderCity;

    @Column(name = "sender_zip_code", length = 50)
    private String senderZipCode;

    @Column(name = "sender_country", length = 100)
    private String senderCountry;

    @Column(name = "receiver_eng_name", length = 100)
    private String receiverEngName;

    @Column(name = "receiver_address_detail", length = 255)
    private String receiverAddressDetail;

    @Column(name = "receiver_district", length = 100)
    private String receiverDistrict;

    @Column(name = "receiver_city", length = 100)
    private String receiverCity;

    @Column(name = "receiver_zip_code", length = 50)
    private String receiverZipCode;

    @Column(name = "receiver_phone", length = 100)
    private String receiverPhone;

    @Column(name = "swift_code", length = 100)
    private String swiftCode;

    @Column(name = "receiver_account_num", length = 100)
    private String receiverAccountNum;

    @Column(name = "routing_number", length = 100)
    private String routingNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "remit_reason", nullable = false)
    private String remitReason;

    @Column(name = "external_request_id", length = 100, nullable = false, unique = true)
    private String externalRequestId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private GlobalTransactionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "failure_reason", length = 100)
    private GlobalTransactionFailureReason failureReason;

    public void markSuccess() {
        this.status = GlobalTransactionStatus.SUCCESS;
        this.failureReason = null;
    }

    public void markFailed(GlobalTransactionFailureReason failureReason) {
        this.status = GlobalTransactionStatus.FAILED;
        this.failureReason = failureReason;
    }
}
