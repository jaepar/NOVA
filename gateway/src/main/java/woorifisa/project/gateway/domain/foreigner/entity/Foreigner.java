package woorifisa.project.gateway.domain.foreigner.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Table(name = "foreigner")
public class Foreigner {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "foreigner_id")
	private Long foreignerId;

	@Column(name = "name", nullable = false, length = 100)
	private String name;

	@Column(name = "registration_number_hash", nullable = false, unique = true, length = 64)
	private String registrationNumberHash;

	@Column(name = "issue_date", nullable = false, length = 20)
	private String issueDate;

	@Column(name = "active", nullable = false)
	private Boolean active;
}
