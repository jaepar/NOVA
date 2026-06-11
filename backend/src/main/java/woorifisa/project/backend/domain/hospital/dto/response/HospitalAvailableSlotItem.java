package woorifisa.project.backend.domain.hospital.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import woorifisa.project.backend.domain.hospital.entity.HospitalAvailableSlot;

public record HospitalAvailableSlotItem(
    @JsonProperty("available_at")
    LocalDateTime availableAt,
    @JsonProperty("is_available")
    boolean isAvailable
) {
    public static HospitalAvailableSlotItem from(HospitalAvailableSlot slot) {
        return new HospitalAvailableSlotItem(
            slot.getAvailableAt(),
            slot.isAvailable()
        );
    }
}
