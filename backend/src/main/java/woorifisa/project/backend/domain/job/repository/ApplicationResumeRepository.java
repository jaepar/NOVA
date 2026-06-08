package woorifisa.project.backend.domain.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import woorifisa.project.backend.domain.job.entity.ApplicationResume;

public interface ApplicationResumeRepository extends JpaRepository<ApplicationResume, Long> {

	@Query("""
		select applicationResume
		from ApplicationResume applicationResume
		join fetch applicationResume.resume
		join applicationResume.application application
		where application.applicationId = :applicationId
			and application.user.userId = :userId
		order by applicationResume.applicationResumeId asc
		""")
	List<ApplicationResume> findAllPortfolios(
		@Param("applicationId") Long applicationId,
		@Param("userId") Long userId
	);
}
