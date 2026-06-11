package woorifisa.project.backend.domain.user.entity;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.time.LocalDateTime;

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
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.entity.enums.Gender;
import woorifisa.project.backend.global.entity.BaseEntity;
import woorifisa.project.backend.global.exception.CustomException;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "birth", length = 10, nullable = false)
    private String birth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    @Column(name = "has_residence_card", nullable = false)
    private Boolean hasResidenceCard;

    @Enumerated(EnumType.STRING)
    @Column(name = "certificate_status", nullable = false, length = 20)
    private CertificateStatus certificateStatus;

    @Column(name = "has_delete", nullable = false)
    private Boolean hasDelete;

    @Column(name = "issued_time")
    private LocalDateTime issuedTime;

    public void startCertificateIssuance() {
        // 인증서 상태는 발급 전에서만 신청 중으로 전환할 수 있다.
        if (this.certificateStatus != CertificateStatus.NOT_ISSUED) {
            throw new CustomException(USER_CERTIFICATE_STATUS_TRANSITION_INVALID);
        }
        this.certificateStatus = CertificateStatus.PENDING;
    }

    public void issueCertificate() {
        // 최종 발급은 신청 중 상태에서만 가능하며, 발급 시각을 함께 기록한다.
        if (this.certificateStatus != CertificateStatus.PENDING) {
            throw new CustomException(USER_CERTIFICATE_STATUS_TRANSITION_INVALID);
        }
        this.certificateStatus = CertificateStatus.ISSUED;
        this.issuedTime = LocalDateTime.now();
    }

    public void registerResidenceCard() {
        this.hasResidenceCard = true;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
