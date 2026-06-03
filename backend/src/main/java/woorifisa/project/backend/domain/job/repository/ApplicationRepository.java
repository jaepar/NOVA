package woorifisa.project.backend.domain.job.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.job.entity.Application;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.user.entity.User;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

	boolean existsByUserAndJob(User user, Job job);

	// 목록 응답 생성 시 job 정보를 사용하므로 N+1 쿼리를 방지하기 위해 함께 조회
	@EntityGraph(attributePaths = "job")
	List<Application> findAllByUser_UserIdOrderByCreatedAtDesc(Long userId);

	// 포트폴리오 조회 시 resume 정보를 사용하므로 추가 쿼리를 줄이기 위해 함께 조회
	@EntityGraph(attributePaths = "resume")
	Optional<Application> findByApplicationIdAndUser_UserId(Long applicationId, Long userId);
}
