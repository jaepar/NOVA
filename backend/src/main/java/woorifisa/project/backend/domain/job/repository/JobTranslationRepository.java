package woorifisa.project.backend.domain.job.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import woorifisa.project.backend.domain.job.entity.JobTranslation;

@Repository
public interface JobTranslationRepository extends JpaRepository<JobTranslation, Long> {

	List<JobTranslation> findAllByJob_JobIdInAndLanguage(Collection<Long> jobIds, String language);

	Optional<JobTranslation> findByJob_JobIdAndLanguage(Long jobId, String language);
}
