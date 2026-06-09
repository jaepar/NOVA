package woorifisa.project.backend.domain.job.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import woorifisa.project.backend.domain.user.entity.Resume;
import woorifisa.project.backend.global.entity.BaseEntity;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "application_resume")
public class ApplicationResume extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "application_resume_id")
	private Long applicationResumeId;

	@ManyToOne(optional = false)
	@JoinColumn(name = "application_id", nullable = false)
	private Application application;

	@ManyToOne(optional = false)
	@JoinColumn(name = "resume_id", nullable = false)
	private Resume resume;
}
