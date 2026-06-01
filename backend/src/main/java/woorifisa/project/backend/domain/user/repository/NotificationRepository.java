package woorifisa.project.backend.domain.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import woorifisa.project.backend.domain.user.entity.Notification;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.NotificationType;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

	void deleteByUserAndType(User user, NotificationType type);
}
