package woorifisa.project.backend.domain.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.hospital.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}
