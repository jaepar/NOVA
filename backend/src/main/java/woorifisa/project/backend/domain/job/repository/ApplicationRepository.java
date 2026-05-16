package woorifisa.project.backend.domain.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.job.entity.Application;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
}
