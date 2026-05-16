package woorifisa.project.backend.domain.cs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.cs.entity.Cs;

@Repository
public interface CsRepository extends JpaRepository<Cs, Long> {
}
