package woorifisa.project.backend.domain.hospital.dto.request;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateReservationRequest(
    @JsonProperty("hospital_id")
    Long hospitalId,
    @JsonProperty("reserved_at")
    LocalDateTime reservedAt
) {
}
