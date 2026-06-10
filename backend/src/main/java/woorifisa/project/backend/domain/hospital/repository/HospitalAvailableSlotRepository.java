package woorifisa.project.backend.domain.hospital.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import woorifisa.project.backend.domain.hospital.entity.HospitalAvailableSlot;

@Repository
public interface HospitalAvailableSlotRepository extends JpaRepository<HospitalAvailableSlot, Long> {

    Optional<HospitalAvailableSlot> findByHospitalHospitalIdAndAvailableAt(Long hospitalId, LocalDateTime availableAt);

    boolean existsByHospitalHospitalIdAndAvailableAt(Long hospitalId, LocalDateTime availableAt);

    void deleteByAvailableAtBefore(LocalDateTime availableAt);
}
