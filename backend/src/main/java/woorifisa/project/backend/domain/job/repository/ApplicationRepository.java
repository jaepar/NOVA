package woorifisa.project.backend.domain.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.job.entity.Application;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.user.entity.User;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

	boolean existsByUserAndJob(User user, Job job);
}
