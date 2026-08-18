package com.rolliq.api.repository;

import com.rolliq.api.model.SessionTechnique;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionTechniqueRepository
        extends JpaRepository<SessionTechnique, SessionTechnique.Id> {

    // "Id" navigates into the embedded composite key (SessionTechnique.Id.sessionId).
    List<SessionTechnique> findByIdSessionIdAndUserId(UUID sessionId, UUID userId);

    void deleteByIdSessionIdAndUserId(UUID sessionId, UUID userId);
}
