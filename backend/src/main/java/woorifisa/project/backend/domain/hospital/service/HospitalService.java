package woorifisa.project.backend.domain.hospital.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_AVAILABLE_SLOT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import woorifisa.project.backend.domain.hospital.dto.request.CreateReservationRequest;
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
                .build()
        );
    }
}
