package woorifisa.project.backend.domain.hospital.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;

class HospitalServiceTest {

    @Test
    @DisplayName("type이 없으면 전체 병원 목록을 조회한다")
    void findHospitalsWithoutType() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalService hospitalService = new HospitalService(hospitalRepository);
        when(hospitalRepository.findAll()).thenReturn(List.of(
            Hospital.builder()
                .hospitalId(1L)
                .name("우리내과")
                .type(DepartmentType.INTERNAL_MEDICINE)
                .doctorName("김의사")
                .address("서울 중구")
                .openTime("09:00")
                .closeTime("18:00")
                .breakTime("13:00-14:00")
                .dayOff("일요일")
                .build()
        ));

        HospitalListResponse response = hospitalService.findHospitals(null);

        verify(hospitalRepository).findAll();
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).hospitalId()).isEqualTo(1L);
        assertThat(response.items().get(0).type()).isEqualTo(DepartmentType.INTERNAL_MEDICINE);
    }

    @Test
    @DisplayName("type이 있으면 해당 진료과 병원 목록만 조회한다")
    void findHospitalsWithType() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalService hospitalService = new HospitalService(hospitalRepository);
        when(hospitalRepository.findAllByType(DepartmentType.DENTAL)).thenReturn(List.of(
            Hospital.builder()
                .hospitalId(2L)
                .name("미소치과")
                .type(DepartmentType.DENTAL)
                .doctorName("박의사")
                .address("서울 강남구")
                .openTime("10:00")
                .closeTime("19:00")
                .breakTime("13:00-14:00")
                .dayOff("일요일")
                .build()
        ));

        HospitalListResponse response = hospitalService.findHospitals(DepartmentType.DENTAL);

        verify(hospitalRepository).findAllByType(DepartmentType.DENTAL);
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).hospitalId()).isEqualTo(2L);
        assertThat(response.items().get(0).name()).isEqualTo("미소치과");
    }
}
