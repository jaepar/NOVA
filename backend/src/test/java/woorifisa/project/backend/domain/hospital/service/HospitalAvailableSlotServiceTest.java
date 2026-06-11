package woorifisa.project.backend.domain.hospital.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.HospitalAvailableSlot;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.repository.HospitalAvailableSlotRepository;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;

class HospitalAvailableSlotServiceTest {

    @Test
    @DisplayName("오늘부터 30일치 예약 가능 슬롯을 생성한다")
    void refreshAvailableSlotsCreatesThirtyDays() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        HospitalAvailableSlotService service = new HospitalAvailableSlotService(hospitalRepository, hospitalAvailableSlotRepository);
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .name("서울하나내과")
            .type(DepartmentType.INTERNAL_MEDICINE)
            .doctorName("김민수")
            .address("서울특별시 중구 세종대로 110")
            .openTime("09:00")
            .closeTime("11:00")
            .breakTime("10:00-10:30")
            .dayOff("일요일")
            .build();

        when(hospitalRepository.findAll()).thenReturn(List.of(hospital));
        when(hospitalAvailableSlotRepository.existsByHospitalHospitalIdAndAvailableAt(any(), any())).thenReturn(false);

        int created = service.refreshAvailableSlots(LocalDate.of(2026, 6, 10));

        verify(hospitalAvailableSlotRepository).deleteByAvailableAtBefore(LocalDate.of(2026, 6, 10).atStartOfDay());
        verify(hospitalAvailableSlotRepository, times(78)).save(any(HospitalAvailableSlot.class));
        assertThat(created).isEqualTo(78);
    }

    @Test
    @DisplayName("휴무일은 슬롯을 생성하지 않는다")
    void refreshAvailableSlotsSkipsDayOff() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        HospitalAvailableSlotService service = new HospitalAvailableSlotService(hospitalRepository, hospitalAvailableSlotRepository);
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .name("서울하나내과")
            .type(DepartmentType.INTERNAL_MEDICINE)
            .doctorName("김민수")
            .address("서울특별시 중구 세종대로 110")
            .openTime("09:00")
            .closeTime("10:00")
            .breakTime(null)
            .dayOff("수요일")
            .build();

        when(hospitalRepository.findAll()).thenReturn(List.of(hospital));
        when(hospitalAvailableSlotRepository.existsByHospitalHospitalIdAndAvailableAt(any(), any())).thenReturn(false);

        int created = service.refreshAvailableSlots(LocalDate.of(2026, 6, 10));

        assertThat(created).isEqualTo(50);
    }

    @Test
    @DisplayName("이미 존재하는 슬롯은 중복 생성하지 않는다")
    void refreshAvailableSlotsSkipsExistingSlot() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        HospitalAvailableSlotService service = new HospitalAvailableSlotService(hospitalRepository, hospitalAvailableSlotRepository);
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .name("서울하나내과")
            .type(DepartmentType.INTERNAL_MEDICINE)
            .doctorName("김민수")
            .address("서울특별시 중구 세종대로 110")
            .openTime("09:00")
            .closeTime("10:00")
            .breakTime(null)
            .dayOff("일요일")
            .build();
        LocalDate today = LocalDate.of(2026, 6, 10);

        when(hospitalRepository.findAll()).thenReturn(List.of(hospital));
        when(hospitalAvailableSlotRepository.existsByHospitalHospitalIdAndAvailableAt(any(), any()))
            .thenReturn(false);
        when(hospitalAvailableSlotRepository.existsByHospitalHospitalIdAndAvailableAt(1L, LocalDateTime.of(2026, 6, 10, 9, 0)))
            .thenReturn(true);
        when(hospitalAvailableSlotRepository.existsByHospitalHospitalIdAndAvailableAt(1L, LocalDateTime.of(2026, 6, 10, 9, 30)))
            .thenReturn(false);

        int created = service.refreshAvailableSlots(today);

        verify(hospitalAvailableSlotRepository, never()).save(org.mockito.ArgumentMatchers.argThat(
            slot -> slot.getAvailableAt().equals(LocalDateTime.of(2026, 6, 10, 9, 0))
        ));
        assertThat(created).isEqualTo(51);
    }
}
