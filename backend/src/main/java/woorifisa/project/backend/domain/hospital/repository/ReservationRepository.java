package woorifisa.project.backend.domain.hospital.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.hospital.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByReservationIdAndUserUserId(Long reservationId, Long userId);
}
