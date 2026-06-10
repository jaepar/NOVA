package woorifisa.project.backend.domain.hospital.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_AVAILABLE_SLOT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_RESERVATION_ALREADY_CANCELED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_RESERVATION_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import woorifisa.project.backend.domain.hospital.dto.request.CreateReservationRequest;
import woorifisa.project.backend.domain.hospital.dto.response.ReservationListResponse;
import woorifisa.project.backend.domain.hospital.entity.HospitalAvailableSlot;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.repository.HospitalAvailableSlotRepository;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;
import woorifisa.project.backend.domain.hospital.repository.ReservationRepository;
import woorifisa.project.backend.domain.hospital.entity.Reservation;
import woorifisa.project.backend.domain.hospital.entity.enums.ReservationStatus;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

class HospitalReservationServiceTest {

    @Test
    @DisplayName("병원과 사용자가 존재하면 예약을 저장한다")
    void createReservation() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(
            hospitalRepository,
            hospitalAvailableSlotRepository,
            reservationRepository,
            userRepository
        );
        CreateReservationRequest request = new CreateReservationRequest(
            1L,
            LocalDateTime.of(2026, 6, 10, 14, 0)
        );
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .build();
        HospitalAvailableSlot slot = HospitalAvailableSlot.builder()
            .slotId(10L)
            .hospital(hospital)
            .availableAt(request.reservedAt())
            .isAvailable(true)
            .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mock(User.class)));
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
        when(hospitalAvailableSlotRepository.findByHospitalHospitalIdAndAvailableAt(1L, request.reservedAt()))
            .thenReturn(Optional.of(slot));

        hospitalService.createReservation(1L, request);

        verify(userRepository).findById(1L);
        verify(hospitalRepository).findById(1L);
        verify(hospitalAvailableSlotRepository).findByHospitalHospitalIdAndAvailableAt(1L, request.reservedAt());
        verify(hospitalAvailableSlotRepository).save(slot);
        verify(reservationRepository).save(any());
        org.assertj.core.api.Assertions.assertThat(slot.isAvailable()).isFalse();
    }

    @Test
    @DisplayName("병원이 없으면 예외를 던진다")
    void createReservationHospitalNotFound() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(
            hospitalRepository,
            hospitalAvailableSlotRepository,
            reservationRepository,
            userRepository
        );
        CreateReservationRequest request = new CreateReservationRequest(
            999L,
            LocalDateTime.of(2026, 6, 10, 14, 0)
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(mock(User.class)));
        when(hospitalRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> hospitalService.createReservation(1L, request))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(HOSPITAL_NOT_FOUND);
    }

    @Test
    @DisplayName("사용자가 없으면 예외를 던진다")
    void createReservationUserNotFound() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(
            hospitalRepository,
            hospitalAvailableSlotRepository,
            reservationRepository,
            userRepository
        );
        CreateReservationRequest request = new CreateReservationRequest(
            1L,
            LocalDateTime.of(2026, 6, 10, 14, 0)
        );

        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> hospitalService.createReservation(1L, request))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(USER_NOT_FOUND);
    }

    @Test
    @DisplayName("예약 가능한 슬롯이 없으면 예외를 던진다")
    void createReservationSlotNotFound() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(
            hospitalRepository,
            hospitalAvailableSlotRepository,
            reservationRepository,
            userRepository
        );
        CreateReservationRequest request = new CreateReservationRequest(
            1L,
            LocalDateTime.of(2026, 6, 10, 14, 0)
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(mock(User.class)));
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(mock(Hospital.class)));
        when(hospitalAvailableSlotRepository.findByHospitalHospitalIdAndAvailableAt(1L, request.reservedAt()))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> hospitalService.createReservation(1L, request))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND);
    }

    @Test
    @DisplayName("예약 가능한 슬롯이 비활성화 상태면 예외를 던진다")
    void createReservationSlotUnavailable() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(
            hospitalRepository,
            hospitalAvailableSlotRepository,
            reservationRepository,
            userRepository
        );
        CreateReservationRequest request = new CreateReservationRequest(
            1L,
            LocalDateTime.of(2026, 6, 10, 14, 0)
        );
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .build();
        HospitalAvailableSlot slot = HospitalAvailableSlot.builder()
            .slotId(10L)
            .hospital(hospital)
            .availableAt(request.reservedAt())
            .isAvailable(false)
            .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mock(User.class)));
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
        when(hospitalAvailableSlotRepository.findByHospitalHospitalIdAndAvailableAt(1L, request.reservedAt()))
            .thenReturn(Optional.of(slot));

        assertThatThrownBy(() -> hospitalService.createReservation(1L, request))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND);

        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("본인 예약을 취소하면 상태를 변경하고 슬롯을 복구한다")
    void cancelReservation() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(
            hospitalRepository,
            hospitalAvailableSlotRepository,
            reservationRepository,
            userRepository
        );
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .build();
        User user = mock(User.class);
        Reservation reservation = Reservation.builder()
            .reservationId(1L)
            .user(user)
            .hospital(hospital)
            .reservedAt(LocalDateTime.of(2026, 6, 10, 14, 0))
            .status(ReservationStatus.RESERVED)
            .build();
        HospitalAvailableSlot slot = HospitalAvailableSlot.builder()
            .slotId(10L)
            .hospital(hospital)
            .availableAt(LocalDateTime.of(2026, 6, 10, 14, 0))
            .isAvailable(false)
            .build();

        when(reservationRepository.findByReservationIdAndUserUserId(1L, 1L)).thenReturn(Optional.of(reservation));
        when(hospitalAvailableSlotRepository.findByHospitalHospitalIdAndAvailableAt(1L, reservation.getReservedAt()))
            .thenReturn(Optional.of(slot));

        hospitalService.cancelReservation(1L, 1L);

        verify(reservationRepository).save(reservation);
        verify(hospitalAvailableSlotRepository).save(slot);
        org.assertj.core.api.Assertions.assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CANCELED);
        org.assertj.core.api.Assertions.assertThat(slot.isAvailable()).isTrue();
    }

    @Test
    @DisplayName("예약이 없으면 취소할 수 없다")
    void cancelReservationNotFound() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(
            hospitalRepository,
            hospitalAvailableSlotRepository,
            reservationRepository,
            userRepository
        );

        when(reservationRepository.findByReservationIdAndUserUserId(1L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> hospitalService.cancelReservation(1L, 1L))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(HOSPITAL_RESERVATION_NOT_FOUND);
    }

    @Test
    @DisplayName("이미 취소된 예약은 다시 취소할 수 없다")
    void cancelReservationAlreadyCanceled() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(
            hospitalRepository,
            hospitalAvailableSlotRepository,
            reservationRepository,
            userRepository
        );
        Hospital hospital = Hospital.builder()
            .hospitalId(1L)
            .build();
        Reservation reservation = Reservation.builder()
            .reservationId(1L)
            .user(mock(User.class))
            .hospital(hospital)
            .reservedAt(LocalDateTime.of(2026, 6, 10, 14, 0))
            .status(ReservationStatus.CANCELED)
            .build();

        when(reservationRepository.findByReservationIdAndUserUserId(1L, 1L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> hospitalService.cancelReservation(1L, 1L))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(HOSPITAL_RESERVATION_ALREADY_CANCELED);
    }

    @Test
    @DisplayName("사용자 예약 목록을 최신순으로 조회한다")
    void findReservations() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(
            hospitalRepository,
            hospitalAvailableSlotRepository,
            reservationRepository,
            userRepository
        );
        Hospital hospital = Hospital.builder()
            .hospitalId(2L)
            .name("강남튼튼정형외과")
            .doctorName("이준호")
            .build();
        Reservation reservation = Reservation.builder()
            .reservationId(1L)
            .hospital(hospital)
            .reservedAt(LocalDateTime.of(2026, 6, 10, 14, 0))
            .status(ReservationStatus.RESERVED)
            .build();

        when(reservationRepository.findAllByUserUserIdOrderByReservedAtDesc(1L)).thenReturn(List.of(reservation));

        ReservationListResponse response = hospitalService.findReservations(1L);

        verify(reservationRepository).findAllByUserUserIdOrderByReservedAtDesc(1L);
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).reservationId()).isEqualTo(1L);
        assertThat(response.items().get(0).hospitalId()).isEqualTo(2L);
        assertThat(response.items().get(0).hospitalName()).isEqualTo("강남튼튼정형외과");
        assertThat(response.items().get(0).doctorName()).isEqualTo("이준호");
        assertThat(response.items().get(0).reservedAt()).isEqualTo(LocalDateTime.of(2026, 6, 10, 14, 0));
        assertThat(response.items().get(0).status()).isEqualTo(ReservationStatus.RESERVED);
    }
}
