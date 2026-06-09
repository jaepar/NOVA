package woorifisa.project.backend.domain.user.dto.response;

import java.time.LocalDateTime;

import woorifisa.project.backend.domain.user.entity.Notification;

public record NotificationResponse(
	Long notificationId,
	String type,
	String content,
	LocalDateTime createdAt
) {
	public static NotificationResponse from(Notification notification) {
		return new NotificationResponse(
			notification.getNotificationId(),
			notification.getType().name(),
			notification.getContent(),
			notification.getCreatedAt()
		);
	}
}
