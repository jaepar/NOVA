package woorifisa.project.coreBanking.domain.customer.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import woorifisa.project.coreBanking.domain.customer.entity.enums.CustomerPurpose;
import woorifisa.project.coreBanking.domain.customer.entity.enums.FundSource;
import woorifisa.project.coreBanking.global.entity.BaseEntity;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "customer")
public class Customer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long customerId;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(length = 100, nullable = false)
    private String email;

    @Column(length = 100)
    private String address;

    @Column(length = 50)
    private String job;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerPurpose purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundSource source;

    @Column(name = "has_foreign_tax", nullable = false)
    private Boolean hasForeignTax;
}
