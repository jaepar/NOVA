package woorifisa.project.backend.domain.hospital.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import woorifisa.project.backend.domain.hospital.entity.Reservation;
import woorifisa.project.backend.domain.hospital.entity.enums.ReservationStatus;

public record ReservationListItem(
    @JsonProperty("reservation_id")
    Long reservationId,
    @JsonProperty("hospital_id")
    Long hospitalId,
    @JsonProperty("hospital_name")
    String hospitalName,
    @JsonProperty("doctor_name")
    String doctorName,
    @JsonProperty("reserved_at")
    LocalDateTime reservedAt,
    ReservationStatus status
) {
    public static ReservationListItem from(Reservation reservation) {
        return new ReservationListItem(
            reservation.getReservationId(),
            reservation.getHospital().getHospitalId(),
            reservation.getHospital().getName(),
            reservation.getHospital().getDoctorName(),
            reservation.getReservedAt(),
            reservation.getStatus()
        );
    }
}
