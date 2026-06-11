package woorifisa.project.backend.domain.hospital.dto.response;

import java.util.List;

import woorifisa.project.backend.domain.hospital.entity.Reservation;

public record ReservationListResponse(
    List<ReservationListItem> items
) {
    public static ReservationListResponse from(List<Reservation> reservations) {
        return new ReservationListResponse(
            reservations.stream()
                .map(ReservationListItem::from)
                .toList()
        );
    }
}
