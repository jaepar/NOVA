package woorifisa.project.backend.domain.hospital.dto.response;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import woorifisa.project.backend.domain.hospital.entity.HospitalAvailableSlot;

public record HospitalAvailableSlotResponse(
    @JsonProperty("hospital_id")
    Long hospitalId,
    LocalDate date,
    List<HospitalAvailableSlotItem> items
) {
    public static HospitalAvailableSlotResponse from(
        Long hospitalId,
        LocalDate date,
        List<HospitalAvailableSlot> slots
    ) {
        return new HospitalAvailableSlotResponse(
            hospitalId,
            date,
            slots.stream()
                .map(HospitalAvailableSlotItem::from)
                .toList()
        );
    }
}
