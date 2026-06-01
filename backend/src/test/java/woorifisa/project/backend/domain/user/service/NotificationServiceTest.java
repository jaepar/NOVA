package woorifisa.project.backend.domain.user.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.repository.NotificationRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

	@Mock
	private NotificationRepository notificationRepository;

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private NotificationService notificationService;

	@Test
	@DisplayName("외국인등록증 기간 알림은 1개월, 2개월, 만료 7일 전부터 생성된다")
	void createResidenceCardPeriodNotificationsBySchedule() {
		User user = User.builder()
			.userId(1L)
			.hasCertificate(true)
			.hasResidenceCard(false)
			.issuedTime(LocalDateTime.of(2026, 3, 1, 10, 0))
			.build();
		when(userRepository.findAllByHasCertificateTrueAndHasResidenceCardFalseAndIssuedTimeIsNotNull())
			.thenReturn(List.of(user));

		int oneMonth = notificationService.createResidenceCardPeriodNotifications(LocalDate.of(2026, 4, 1));
		int twoMonth = notificationService.createResidenceCardPeriodNotifications(LocalDate.of(2026, 5, 1));
		int daily = notificationService.createResidenceCardPeriodNotifications(LocalDate.of(2026, 5, 25));
		int outOfRange = notificationService.createResidenceCardPeriodNotifications(LocalDate.of(2026, 5, 20));

		verify(notificationRepository, times(3)).deleteByUserAndType(any(), any());
		verify(notificationRepository, times(3)).save(any());
		org.assertj.core.api.Assertions.assertThat(oneMonth).isEqualTo(1);
		org.assertj.core.api.Assertions.assertThat(twoMonth).isEqualTo(1);
		org.assertj.core.api.Assertions.assertThat(daily).isEqualTo(1);
		org.assertj.core.api.Assertions.assertThat(outOfRange).isEqualTo(0);
	}
}
