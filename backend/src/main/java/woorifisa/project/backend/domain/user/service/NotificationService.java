package woorifisa.project.backend.domain.user.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.domain.user.entity.Notification;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.dto.response.NotificationResponse;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.entity.enums.NotificationType;
import woorifisa.project.backend.domain.user.repository.NotificationRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

	// 매일 오전 9시에 외국인등록증 기간 알림 생성 작업을 실행
	@Transactional
	@Scheduled(cron = "0 0 9 * * *")
	public void createResidenceCardPeriodNotifications() {
		createResidenceCardPeriodNotifications(LocalDate.now());
	}

	// 대상 유저를 조회해 오늘 기준 알림 생성 조건을 만족하는 경우 알림을 생성
	@Transactional
	public int createResidenceCardPeriodNotifications(LocalDate today) {
		// 인증서가 발급되었고, 외국인등록증을 등록하지 않았고, 인증서 발급일자가 있는 유저를 타겟으로 선정
		List<User> targets = userRepository.findAllByCertificateStatusAndHasResidenceCardFalseAndIssuedTimeIsNotNull(
			CertificateStatus.ISSUED
		);
		int createdCount = 0;

		for (User user : targets) {
			LocalDate issuedDate = user.getIssuedTime().toLocalDate();
			if (!shouldCreateResidencePeriodNotification(issuedDate, today)) {
				continue;
			}

			createOrReplaceResidenceCardPeriodNotification(user, buildResidenceCardPeriodContent(issuedDate, today));
			createdCount++;
		}

		log.info("[notification:residence_card_period_created] date={}, createdCount={}", today, createdCount);
		return createdCount;
	}

	// 인증서 발급일 기준 1개월/2개월 경과일 또는 만료 7일 전~전일까지인지 판단한다.
	// true -> 알림 생성, false -> 건너 뜀(알림 생성 x)
	private boolean shouldCreateResidencePeriodNotification(LocalDate issuedDate, LocalDate today) {
		LocalDate oneMonthDate = issuedDate.plusMonths(1);
		LocalDate twoMonthDate = issuedDate.plusMonths(2);
		LocalDate deadline = issuedDate.plusMonths(3);
		LocalDate dailyStart = deadline.minusDays(7);

		if (today.equals(oneMonthDate) || today.equals(twoMonthDate)) {
			return true;
		}

		// dailyStart <= today < deadline
		return !today.isBefore(dailyStart) && today.isBefore(deadline);
	}

	// 생성 시점에 맞는 외국인등록증 기간 알림 문구를 구성한다.
	private String buildResidenceCardPeriodContent(LocalDate issuedDate, LocalDate today) {
		LocalDate deadline = issuedDate.plusMonths(3);
		// today 부터 deadline 까지 남은 일수를 계산
		long daysUntilDeadline = ChronoUnit.DAYS.between(today, deadline);

		if (daysUntilDeadline > 7) {
			if (today.equals(issuedDate.plusMonths(1))) {
				return "인증서 발급 후 1개월이 지났습니다. 외국인등록증을 2개월 이내에 등록해주세요.";
			}
			if (today.equals(issuedDate.plusMonths(2))) {
				return "인증서 발급 후 2개월이 지났습니다. 외국인등록증 등록 기한이 1개월 남았습니다.";
			}
		}
		return "외국인등록증 등록 기한까지 " + daysUntilDeadline + "일 남았습니다. 기한 내 등록해주세요.";
	}

	// 보완서류 타입 알림을 유저 기준으로 최신 1건만 유지하며 저장
	@Transactional
	public void createOrReplaceSupplementDocumentNotification(User user, String content) {
		createOrReplace(user, NotificationType.SUPPLEMENT_DOCUMENT, content);
	}

	// 보완 서류 재제출이 완료된 한경우 보완서류 알림을 삭제
	@Transactional
	public void deleteSupplementDocumentNotification(User user) {
		notificationRepository.deleteByUserAndType(user, NotificationType.SUPPLEMENT_DOCUMENT);
	}

	// 외국인등록증 기간 타입 알림을 유저 기준으로 최신 1건만 유지하며 저장
	@Transactional
	public void createOrReplaceResidenceCardPeriodNotification(User user, String content) {
		createOrReplace(user, NotificationType.RESIDENCE_CARD_PERIOD, content);
	}

	// 외국인등록증 등록이 완료된 경우 기간 알림을 삭제
	@Transactional
	public void deleteResidenceCardPeriodNotification(User user) {
		notificationRepository.deleteByUserAndType(user, NotificationType.RESIDENCE_CARD_PERIOD);
	}

	// 알림 클릭 시 본인 소유 알림만 삭제한다.
	@Transactional
	public boolean deleteNotificationById(Long userId, Long notificationId) {
		long deleted = notificationRepository.deleteByNotificationIdAndUser_UserId(notificationId, userId);
		return deleted > 0;
	}

	// 사용자의 알림 목록을 최신순으로 조회
	@Transactional(readOnly = true)
	public List<NotificationResponse> getNotifications(Long userId) {
		return notificationRepository.findAllByUser_UserIdOrderByCreatedAtDesc(userId).stream()
			.map(NotificationResponse::from)
			.collect(Collectors.toList());
	}

	// 동일 유저/타입 기존 알림을 삭제한 뒤 새 알림 1건을 저장한다.
	@Transactional
	protected void createOrReplace(User user, NotificationType type, String content) {
		// 기존 알림 삭제
		notificationRepository.deleteByUserAndType(user, type);
		// 새로운 알림 생성
		notificationRepository.save(Notification.builder()
				.user(user)
				.type(type)
				.content(content)
				.build());
	}

}
