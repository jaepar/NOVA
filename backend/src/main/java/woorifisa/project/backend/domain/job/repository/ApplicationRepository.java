package woorifisa.project.backend.domain.job.repository;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.job.entity.Application;
import woorifisa.project.backend.domain.job.entity.Job;
import woorifisa.project.backend.domain.user.entity.User;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

	boolean existsByUserAndJob(User user, Job job);

	// 목록 응답 생성 시 job 정보를 사용하므로 N+1 쿼리를 방지하기 위해 함께 조회
	@EntityGraph(attributePaths = "job")
	Slice<Application> findAllByUser_UserId(Long userId, Pageable pageable);

	Optional<Application> findByApplicationIdAndUser_UserId(Long applicationId, Long userId);
}
