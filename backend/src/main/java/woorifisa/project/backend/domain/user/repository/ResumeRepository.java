package woorifisa.project.backend.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.user.entity.Resume;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
}
