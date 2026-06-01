package woorifisa.project.backend.domain.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.global.entity.BaseEntity;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "document")
public class Document extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "document_id")
	private Long documentId;

	@ManyToOne(optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "document_type", nullable = false)
	private DocumentType documentType;

	@Column(name = "file_url", columnDefinition = "TEXT", nullable = false)
	private String fileUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private DocumentStatus status;

	@Column(name = "missing", columnDefinition = "TEXT")
	private String missing;

	public void updateSubmission(String fileUrl, DocumentStatus status) {
		this.fileUrl = fileUrl;
		this.status = status;
		this.missing = null;
	}

	public void changeStatus(String fileUrl, DocumentStatus status, String missing) {
		this.fileUrl = fileUrl;
		this.status = status;
		this.missing = missing;
	}
}
