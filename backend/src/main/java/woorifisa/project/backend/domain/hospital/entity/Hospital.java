package woorifisa.project.backend.domain.hospital.entity;

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
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.global.entity.BaseEntity;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hospital")
public class Hospital extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hospital_id")
    private Long hospitalId;

    @Column(length = 100, nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DepartmentType type;

    @Column(name = "doctor_name", length = 50)
    private String doctorName;

    @Column(length = 255)
    private String address;

    @Column(name = "open_time", length = 100)
    private String openTime;

    @Column(name = "close_time", length = 100)
    private String closeTime;

    @Column(name = "break_time", length = 100)
    private String breakTime;

    @Column(name = "day_off", length = 100)
    private String dayOff;
}
