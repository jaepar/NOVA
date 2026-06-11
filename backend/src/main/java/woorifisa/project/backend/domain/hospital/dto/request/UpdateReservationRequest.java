package woorifisa.project.backend.domain.hospital.dto.request;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateReservationRequest(
    String action,
    @JsonProperty("reserved_at")
    LocalDateTime reservedAt
) {
}
