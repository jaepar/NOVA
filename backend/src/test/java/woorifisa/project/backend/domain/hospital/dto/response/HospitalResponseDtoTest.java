package woorifisa.project.backend.domain.hospital.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import woorifisa.project.backend.domain.hospital.entity.Hospital;
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
}
