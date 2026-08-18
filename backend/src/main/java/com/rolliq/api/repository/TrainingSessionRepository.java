package com.rolliq.api.repository;

import com.rolliq.api.model.TrainingSession;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingSessionRepository extends JpaRepository<TrainingSession, UUID> {

    List<TrainingSession> findByUserIdOrderByDateDescCreatedAtDesc(UUID userId);

    Optional<TrainingSession> findByIdAndUserId(UUID id, UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);
}
