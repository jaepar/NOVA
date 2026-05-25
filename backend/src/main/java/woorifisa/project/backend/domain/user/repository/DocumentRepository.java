package woorifisa.project.backend.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.user.entity.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
}

