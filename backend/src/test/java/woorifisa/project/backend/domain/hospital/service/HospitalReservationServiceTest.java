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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import woorifisa.project.backend.domain.hospital.dto.request.CreateReservationRequest;
import woorifisa.project.backend.domain.hospital.dto.response.HospitalAvailableSlotResponse;
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

        hospitalService.updateReservation(1L, 1L, "CANCEL", null);

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

        assertThatThrownBy(() -> hospitalService.updateReservation(1L, 1L, "CANCEL", null))
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

        assertThatThrownBy(() -> hospitalService.updateReservation(1L, 1L, "CANCEL", null))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(HOSPITAL_RESERVATION_ALREADY_CANCELED);
    }

    @Test
    @DisplayName("본인 예약을 변경하면 기존 슬롯을 복구하고 새 슬롯을 점유한다")
    void changeReservation() {
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
            .status(ReservationStatus.RESERVED)
            .build();
        HospitalAvailableSlot currentSlot = HospitalAvailableSlot.builder()
            .slotId(10L)
            .hospital(hospital)
            .availableAt(LocalDateTime.of(2026, 6, 10, 14, 0))
            .isAvailable(false)
            .build();
        HospitalAvailableSlot newSlot = HospitalAvailableSlot.builder()
            .slotId(11L)
            .hospital(hospital)
            .availableAt(LocalDateTime.of(2026, 6, 11, 15, 0))
            .isAvailable(true)
            .build();

        when(reservationRepository.findByReservationIdAndUserUserId(1L, 1L)).thenReturn(Optional.of(reservation));
        when(hospitalAvailableSlotRepository.findByHospitalHospitalIdAndAvailableAt(1L, reservation.getReservedAt()))
            .thenReturn(Optional.of(currentSlot));
        when(hospitalAvailableSlotRepository.findByHospitalHospitalIdAndAvailableAt(1L, LocalDateTime.of(2026, 6, 11, 15, 0)))
            .thenReturn(Optional.of(newSlot));

        hospitalService.updateReservation(1L, 1L, "CHANGE", LocalDateTime.of(2026, 6, 11, 15, 0));

        verify(reservationRepository).save(reservation);
        verify(hospitalAvailableSlotRepository).save(currentSlot);
        verify(hospitalAvailableSlotRepository).save(newSlot);
        assertThat(currentSlot.isAvailable()).isTrue();
        assertThat(newSlot.isAvailable()).isFalse();
        assertThat(reservation.getReservedAt()).isEqualTo(LocalDateTime.of(2026, 6, 11, 15, 0));
        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.RESERVED);
    }

    @Test
    @DisplayName("변경할 예약 시간이 없으면 예약을 변경할 수 없다")
    void changeReservationSlotNotFound() {
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
            .status(ReservationStatus.RESERVED)
            .build();
        HospitalAvailableSlot currentSlot = HospitalAvailableSlot.builder()
            .slotId(10L)
            .hospital(hospital)
            .availableAt(LocalDateTime.of(2026, 6, 10, 14, 0))
            .isAvailable(false)
            .build();

        when(reservationRepository.findByReservationIdAndUserUserId(1L, 1L)).thenReturn(Optional.of(reservation));
        when(hospitalAvailableSlotRepository.findByHospitalHospitalIdAndAvailableAt(1L, reservation.getReservedAt()))
            .thenReturn(Optional.of(currentSlot));
        when(hospitalAvailableSlotRepository.findByHospitalHospitalIdAndAvailableAt(1L, LocalDateTime.of(2026, 6, 11, 15, 0)))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> hospitalService.updateReservation(1L, 1L, "CHANGE", LocalDateTime.of(2026, 6, 11, 15, 0)))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND);
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

    @Test
    @DisplayName("특정 병원의 특정 날짜 슬롯을 시간순으로 조회한다")
    void findAvailableSlots() {
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
        HospitalAvailableSlot first = HospitalAvailableSlot.builder()
            .slotId(1L)
            .hospital(hospital)
            .availableAt(LocalDateTime.of(2026, 6, 11, 9, 0))
            .isAvailable(true)
            .build();
        HospitalAvailableSlot second = HospitalAvailableSlot.builder()
            .slotId(2L)
            .hospital(hospital)
            .availableAt(LocalDateTime.of(2026, 6, 11, 9, 30))
            .isAvailable(false)
            .build();

        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
        when(hospitalAvailableSlotRepository.findAllByHospitalHospitalIdAndAvailableAtBetweenOrderByAvailableAtAsc(
            1L,
            LocalDate.of(2026, 6, 11).atStartOfDay(),
            LocalDate.of(2026, 6, 12).atStartOfDay()
        )).thenReturn(List.of(first, second));

        HospitalAvailableSlotResponse response = hospitalService.findAvailableSlots(1L, LocalDate.of(2026, 6, 11));

        assertThat(response.hospitalId()).isEqualTo(1L);
        assertThat(response.date()).isEqualTo(LocalDate.of(2026, 6, 11));
        assertThat(response.items()).hasSize(2);
        assertThat(response.items().get(0).availableAt()).isEqualTo(LocalDateTime.of(2026, 6, 11, 9, 0));
        assertThat(response.items().get(0).isAvailable()).isTrue();
        assertThat(response.items().get(1).availableAt()).isEqualTo(LocalDateTime.of(2026, 6, 11, 9, 30));
        assertThat(response.items().get(1).isAvailable()).isFalse();
    }

    @Test
    @DisplayName("병원이 없으면 예약 가능 시간을 조회할 수 없다")
    void findAvailableSlotsHospitalNotFound() {
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

        when(hospitalRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> hospitalService.findAvailableSlots(1L, LocalDate.of(2026, 6, 11)))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(HOSPITAL_NOT_FOUND);
    }

    @Test
    @DisplayName("슬롯이 없으면 빈 목록을 반환한다")
    void findAvailableSlotsEmpty() {
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

        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
        when(hospitalAvailableSlotRepository.findAllByHospitalHospitalIdAndAvailableAtBetweenOrderByAvailableAtAsc(
            1L,
            LocalDate.of(2026, 6, 11).atStartOfDay(),
            LocalDate.of(2026, 6, 12).atStartOfDay()
        )).thenReturn(List.of());

        HospitalAvailableSlotResponse response = hospitalService.findAvailableSlots(1L, LocalDate.of(2026, 6, 11));

        assertThat(response.hospitalId()).isEqualTo(1L);
        assertThat(response.date()).isEqualTo(LocalDate.of(2026, 6, 11));
        assertThat(response.items()).isEmpty();
    }
}
