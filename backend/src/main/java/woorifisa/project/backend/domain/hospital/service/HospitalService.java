package woorifisa.project.backend.domain.hospital.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_AVAILABLE_SLOT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_RESERVATION_ALREADY_CANCELED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_RESERVATION_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import woorifisa.project.backend.domain.hospital.dto.request.CreateReservationRequest;
import woorifisa.project.backend.domain.hospital.entity.enums.ReservationStatus;
import woorifisa.project.backend.domain.hospital.entity.HospitalAvailableSlot;
import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.Reservation;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.repository.HospitalAvailableSlotRepository;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;
import woorifisa.project.backend.domain.hospital.repository.ReservationRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

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

    // 실제 예약 요청 1건을 처리하는 흐름으로, 미리 준비된 슬롯 존재 여부만 검증한다.
    public void createReservation(Long userId, CreateReservationRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomException(USER_NOT_FOUND));

        Hospital hospital = hospitalRepository.findById(request.hospitalId())
            .orElseThrow(() -> new CustomException(HOSPITAL_NOT_FOUND));

        HospitalAvailableSlot hospitalAvailableSlot = hospitalAvailableSlotRepository
            .findByHospitalHospitalIdAndAvailableAt(request.hospitalId(), request.reservedAt())
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

    public void cancelReservation(Long userId, Long reservationId) {
        Reservation reservation = reservationRepository.findByReservationIdAndUserUserId(reservationId, userId)
            .orElseThrow(() -> new CustomException(HOSPITAL_RESERVATION_NOT_FOUND));

        if (reservation.getStatus() == ReservationStatus.CANCELED) {
            throw new CustomException(HOSPITAL_RESERVATION_ALREADY_CANCELED);
        }

        HospitalAvailableSlot hospitalAvailableSlot = hospitalAvailableSlotRepository
            .findByHospitalHospitalIdAndAvailableAt(reservation.getHospital().getHospitalId(), reservation.getReservedAt())
            .orElseThrow(() -> new CustomException(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND));

        reservation.cancel();
        hospitalAvailableSlot.markAvailable();

        reservationRepository.save(reservation);
        hospitalAvailableSlotRepository.save(hospitalAvailableSlot);
    }
}
