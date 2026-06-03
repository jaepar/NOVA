package woorifisa.project.backend.domain.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.user.entity.Resume;
import woorifisa.project.backend.domain.user.entity.User;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

	// application_id가 NULL인 resume만 지원서 작성 화면의 기존 등록 포트폴리오로 사용한다.
	List<Resume> findByUserAndApplicationIsNullOrderByResumeIdDesc(User user);
}
