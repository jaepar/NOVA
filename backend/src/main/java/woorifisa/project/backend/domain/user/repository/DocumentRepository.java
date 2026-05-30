package woorifisa.project.backend.domain.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
	boolean existsByUser(User user);

	Optional<Document> findTopByUserAndDocumentTypeOrderByDocumentIdDesc(User user, DocumentType documentType);
}

