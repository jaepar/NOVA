package woorifisa.project.backend.domain.user.entity;

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
import woorifisa.project.backend.global.entity.BaseEntity;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "resume")
public class Resume extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resume_id")
    private Long resumeId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "url", length = 255, nullable = false)
    private String url;

    // 파일 자체 삭제가 아니라 마이페이지 포트폴리오 목록에서 제외되었는지를 나타낸다.
    @Column(name = "deleted_from_mypage", nullable = false)
    private boolean deletedFromMyPage;

    public void deleteFromMyPage() {
        this.deletedFromMyPage = true;
    }
}
