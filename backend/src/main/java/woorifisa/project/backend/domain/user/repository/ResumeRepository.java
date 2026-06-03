package woorifisa.project.backend.domain.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.user.entity.Resume;
import woorifisa.project.backend.domain.user.entity.User;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

	List<Resume> findByUserOrderByResumeIdDesc(User user);
}
