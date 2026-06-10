package woorifisa.project.backend.domain.hospital.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.HospitalAvailableSlot;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;

class HospitalResponseDtoTest {

    @Test
    @DisplayName("HospitalItem이 엔티티에서 변환된다")
    void hospitalItemFrom() {
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .name("우리내과")
            .type(DepartmentType.INTERNAL_MEDICINE)
            .doctorName("김의사")
            .address("서울 중구")
            .openTime("09:00")
            .closeTime("18:00")
            .breakTime("13:00-14:00")
            .dayOff("일요일")
            .build();

        HospitalItem item = HospitalItem.from(hospital);

        assertThat(item.hospitalId()).isEqualTo(1L);
        assertThat(item.name()).isEqualTo("우리내과");
        assertThat(item.type()).isEqualTo(DepartmentType.INTERNAL_MEDICINE);
        assertThat(item.doctorName()).isEqualTo("김의사");
    }

    @Test
    @DisplayName("HospitalListResponse가 엔티티 목록에서 변환된다")
    void hospitalListResponseFrom() {
        Hospital hospital = Hospital.builder()
            .hospitalId(2L)
            .name("미소치과")
            .type(DepartmentType.DENTAL)
            .doctorName("박의사")
            .address("서울 강남구")
            .openTime("10:00")
            .closeTime("19:00")
            .breakTime("13:00-14:00")
            .dayOff("일요일")
            .build();

        HospitalListResponse response = HospitalListResponse.from(List.of(hospital));

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).hospitalId()).isEqualTo(2L);
        assertThat(response.items().get(0).name()).isEqualTo("미소치과");
    }

    @Test
    @DisplayName("HospitalAvailableSlotItem이 엔티티에서 변환된다")
    void hospitalAvailableSlotItemFrom() {
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .build();
        HospitalAvailableSlot slot = HospitalAvailableSlot.builder()
            .slotId(1L)
            .hospital(hospital)
            .availableAt(LocalDateTime.of(2026, 6, 11, 9, 0))
            .isAvailable(true)
            .build();

        HospitalAvailableSlotItem item = HospitalAvailableSlotItem.from(slot);

        assertThat(item.availableAt()).isEqualTo(LocalDateTime.of(2026, 6, 11, 9, 0));
        assertThat(item.isAvailable()).isTrue();
    }

    @Test
    @DisplayName("HospitalAvailableSlotResponse가 엔티티 목록에서 변환된다")
    void hospitalAvailableSlotResponseFrom() {
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .build();
        HospitalAvailableSlot slot = HospitalAvailableSlot.builder()
            .slotId(1L)
            .hospital(hospital)
            .availableAt(LocalDateTime.of(2026, 6, 11, 9, 0))
            .isAvailable(true)
            .build();

        HospitalAvailableSlotResponse response = HospitalAvailableSlotResponse.from(
            1L,
            LocalDate.of(2026, 6, 11),
            List.of(slot)
        );

        assertThat(response.hospitalId()).isEqualTo(1L);
        assertThat(response.date()).isEqualTo(LocalDate.of(2026, 6, 11));
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).availableAt()).isEqualTo(LocalDateTime.of(2026, 6, 11, 9, 0));
        assertThat(response.items().get(0).isAvailable()).isTrue();
    }
}
