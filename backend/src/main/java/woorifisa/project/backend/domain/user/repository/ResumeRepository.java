package woorifisa.project.backend.domain.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.user.entity.Resume;
import woorifisa.project.backend.domain.user.entity.User;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

	// 마이페이지에서 삭제되지 않은 포트폴리오만 조회
	List<Resume> findByUserAndDeletedFromMyPageFalseOrderByResumeIdDesc(User user);

	// URL로 기존 포트폴리오를 찾을 때도 마찬가지로 마이페이지에서 삭제되지 않은 포트폴리오만 조회
	Optional<Resume> findByUserAndUrlAndDeletedFromMyPageFalse(User user, String url);
}
