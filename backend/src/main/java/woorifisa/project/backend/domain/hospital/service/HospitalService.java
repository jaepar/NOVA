package woorifisa.project.backend.domain.hospital.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.domain.hospital.dto.request.CreateReservationRequest;
import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.dto.response.ReservationListResponse;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.HospitalAvailableSlot;
import woorifisa.project.backend.domain.hospital.entity.Reservation;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.entity.enums.ReservationStatus;
import woorifisa.project.backend.domain.hospital.repository.HospitalAvailableSlotRepository;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;
import woorifisa.project.backend.domain.hospital.repository.ReservationRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

@Slf4j
@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalAvailableSlotRepository hospitalAvailableSlotRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public HospitalListResponse findHospitals(DepartmentType type) {
        List<Hospital> hospitals = type == null
            ? hospitalRepository.findAll()
            : hospitalRepository.findAllByType(type);

        return HospitalListResponse.from(hospitals);
    }

    public ReservationListResponse findReservations(Long userId) {
        return ReservationListResponse.from(
            reservationRepository.findAllByUserUserIdOrderByReservedAtDesc(userId)
        );
    }

    // 실제 예약 요청 1건을 처리하는 흐름으로, 미리 준비된 슬롯 존재 여부만 검증한다.
    public void createReservation(Long userId, CreateReservationRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomException(USER_NOT_FOUND));

        Hospital hospital = hospitalRepository.findById(request.hospitalId())  // 병원 확인
            .orElseThrow(() -> new CustomException(HOSPITAL_NOT_FOUND));

        HospitalAvailableSlot hospitalAvailableSlot = hospitalAvailableSlotRepository
            .findByHospitalHospitalIdAndAvailableAt(hospital.getHospitalId(), request.reservedAt())
            .orElseThrow(() -> new CustomException(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND));

        if (!hospitalAvailableSlot.isAvailable()) {
            throw new CustomException(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND);
        }

        hospitalAvailableSlot.markUnavailable();
        hospitalAvailableSlotRepository.save(hospitalAvailableSlot);

        reservationRepository.save(
            Reservation.builder()
                .user(user)
                .hospital(hospitalAvailableSlot.getHospital())
                .reservedAt(request.reservedAt())
                .status(ReservationStatus.RESERVED)
                .build()
        );
    }

    public void updateReservation(Long userId, Long reservationId, String action, LocalDateTime reservedAt) {
        Reservation reservation = reservationRepository.findByReservationIdAndUserUserId(reservationId, userId)
            .orElseThrow(() -> new CustomException(HOSPITAL_RESERVATION_NOT_FOUND));

        if (reservation.getStatus() == ReservationStatus.CANCELED) {
            throw new CustomException(HOSPITAL_RESERVATION_ALREADY_CANCELED);
        }

        if ("CANCEL".equals(action)) {
            cancelReservation(reservation);
            return;
        }

        if ("CHANGE".equals(action) && reservedAt != null) {
            changeReservation(reservation, reservedAt);
            return;
        }

        throw new CustomException(HOSPITAL_RESERVATION_INVALID_ACTION);
    }

    private void cancelReservation(Reservation reservation) {
        HospitalAvailableSlot hospitalAvailableSlot = hospitalAvailableSlotRepository
            .findByHospitalHospitalIdAndAvailableAt(reservation.getHospital().getHospitalId(), reservation.getReservedAt())
            .orElseThrow(() -> new CustomException(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND));

        reservation.cancel();
        hospitalAvailableSlot.markAvailable();

        reservationRepository.save(reservation);
        hospitalAvailableSlotRepository.save(hospitalAvailableSlot);
    }

    private void changeReservation(Reservation reservation, LocalDateTime reservedAt) {
        HospitalAvailableSlot currentSlot = hospitalAvailableSlotRepository
            .findByHospitalHospitalIdAndAvailableAt(reservation.getHospital().getHospitalId(), reservation.getReservedAt())
            .orElseThrow(() -> new CustomException(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND));

        HospitalAvailableSlot newSlot = hospitalAvailableSlotRepository
            .findByHospitalHospitalIdAndAvailableAt(reservation.getHospital().getHospitalId(), reservedAt)
            .orElseThrow(() -> new CustomException(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND));

        if (!newSlot.isAvailable()) {
            throw new CustomException(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND);
        }

        currentSlot.markAvailable();
        newSlot.markUnavailable();
        reservation.changeReservedAt(reservedAt);

        reservationRepository.save(reservation);
        hospitalAvailableSlotRepository.save(currentSlot);
        hospitalAvailableSlotRepository.save(newSlot);
    }
}
