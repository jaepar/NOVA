package woorifisa.project.coreBanking.domain.account.entity;

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
import woorifisa.project.coreBanking.domain.account.entity.enums.AccountType;
import woorifisa.project.coreBanking.domain.account.entity.enums.BankCode;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.global.entity.BaseEntity;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "account")
public class Account extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(name = "has_limit", nullable = false)
    private Boolean hasLimit;

    @Column(name = "account_number", length = 100, nullable = false, unique = true)
    private String accountNumber;

    @Column(name = "account_name", length = 100, nullable = false)
    private String accountName;

    @Column(name = "balance", nullable = false)
    private Integer balance;

    @Column(name = "password", length = 100, nullable = false)
    private String password;

    @Column(name = "daily_transfer_limit", nullable = false)
    private Integer dailyTransferLimit;

    @Enumerated(EnumType.STRING)
    @Column(name = "bank_code", nullable = false)
    private BankCode bankCode;

    public void debit(Integer amount) {
        if (amount == null || amount <= 0 || balance < amount) {
            throw new IllegalArgumentException("Invalid debit amount.");
        }

        this.balance -= amount;
    }
}
