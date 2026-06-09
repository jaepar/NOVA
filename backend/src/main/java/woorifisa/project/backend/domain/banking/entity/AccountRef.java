package woorifisa.project.backend.domain.banking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.entity.BaseEntity;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_FAILED;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "account_ref")
public class AccountRef extends BaseEntity {

    public static final String BANK_NAME = "우리";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_ref_id")
    private Long accountRefId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "has_account", nullable = false)
    private Boolean hasAccount;

    @Column(name = "account_name", length = 100)
    private String accountName;

    @Column(name = "account_number", length = 100)
    private String accountNumber;

    @Builder.Default
    @Column(name = "balance", nullable = false)
    private Integer balance = 0;

    @Column(name = "has_limit", nullable = false)
    private Boolean hasLimit;

    @Column(name = "transfer_limit", nullable = false)
    private Integer transferLimit;

    public void debit(Integer amount) {
        if (balance == null || amount == null || amount <= 0 || balance < amount) {
            throw new CustomException(BANKING_TRANSFER_FAILED);
        }
        this.balance -= amount;
    }
}
