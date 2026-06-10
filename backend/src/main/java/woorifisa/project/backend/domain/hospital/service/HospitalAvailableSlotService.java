package woorifisa.project.backend.domain.hospital.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.HospitalAvailableSlot;
import woorifisa.project.backend.domain.hospital.repository.HospitalAvailableSlotRepository;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class HospitalAvailableSlotService {

    private static final int WINDOW_DAYS = 30;

    private final HospitalRepository hospitalRepository;
    private final HospitalAvailableSlotRepository hospitalAvailableSlotRepository;

    // 예약 요청 처리와 분리해서, 병원별 30일치 슬롯을 미리 생성/정리하는 배치성 책임만 맡는다.
    @Transactional
    @Scheduled(cron = "0 5 0 * * *")
    public void refreshAvailableSlotsDaily() {
        int created = refreshAvailableSlots(LocalDate.now());
        log.info("[hospital:slot_refresh] date={}, createdCount={}", LocalDate.now(), created);
    }

    // 오늘 이전 슬롯은 정리하고, 병원 운영시간 기준으로 앞으로 30일치 슬롯을 보충한다.
    @Transactional
    public int refreshAvailableSlots(LocalDate today) {
        hospitalAvailableSlotRepository.deleteByAvailableAtBefore(today.atStartOfDay());

        int createdCount = 0;
        List<Hospital> hospitals = hospitalRepository.findAll();

        for (Hospital hospital : hospitals) {
            createdCount += createSlotsForHospital(hospital, today);
        }

        return createdCount;
    }

    private int createSlotsForHospital(Hospital hospital, LocalDate today) {
        LocalTime openTime = LocalTime.parse(hospital.getOpenTime());
        LocalTime closeTime = LocalTime.parse(hospital.getCloseTime());
        LocalTime breakStart = null;
        LocalTime breakEnd = null;

        if (hospital.getBreakTime() != null && !hospital.getBreakTime().isBlank()) {
            String[] breakTimes = hospital.getBreakTime().split("-");
            breakStart = LocalTime.parse(breakTimes[0]);
            breakEnd = LocalTime.parse(breakTimes[1]);
        }

        int createdCount = 0;
        for (int dayOffset = 0; dayOffset < WINDOW_DAYS; dayOffset++) {
            LocalDate targetDate = today.plusDays(dayOffset);
            if (isDayOff(hospital.getDayOff(), targetDate.getDayOfWeek())) {
                continue;
            }

            // 병원 운영시간을 30분 단위로 순회하면서 휴게시간을 제외한 슬롯만 생성한다.
            LocalTime current = openTime;
            while (current.isBefore(closeTime)) {
                if (!isInsideBreakTime(current, breakStart, breakEnd)) {
                    LocalDateTime availableAt = LocalDateTime.of(targetDate, current);
                    if (!hospitalAvailableSlotRepository.existsByHospitalHospitalIdAndAvailableAt(hospital.getHospitalId(), availableAt)) {
                        hospitalAvailableSlotRepository.save(
                            HospitalAvailableSlot.builder()
                                .hospital(hospital)
                                .availableAt(availableAt)
                                .isAvailable(true)
                                .build()
                        );
                        createdCount++;
                    }
                }
                current = current.plusMinutes(30);
            }
        }

        return createdCount;
    }

    private boolean isInsideBreakTime(LocalTime current, LocalTime breakStart, LocalTime breakEnd) {
        if (breakStart == null || breakEnd == null) {
            return false;
        }

        return !current.isBefore(breakStart) && current.isBefore(breakEnd);
    }

    private boolean isDayOff(String dayOff, DayOfWeek dayOfWeek) {
        if (dayOff == null || dayOff.isBlank()) {
            return false;
        }

        return switch (dayOff.trim()) {
            case "월요일" -> dayOfWeek == DayOfWeek.MONDAY;
            case "화요일" -> dayOfWeek == DayOfWeek.TUESDAY;
            case "수요일" -> dayOfWeek == DayOfWeek.WEDNESDAY;
            case "목요일" -> dayOfWeek == DayOfWeek.THURSDAY;
            case "금요일" -> dayOfWeek == DayOfWeek.FRIDAY;
            case "토요일" -> dayOfWeek == DayOfWeek.SATURDAY;
            case "일요일" -> dayOfWeek == DayOfWeek.SUNDAY;
            default -> false;
        };
    }
}
