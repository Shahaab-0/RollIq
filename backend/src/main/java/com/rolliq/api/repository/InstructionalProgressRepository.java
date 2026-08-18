package com.rolliq.api.repository;

import com.rolliq.api.model.InstructionalProgress;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstructionalProgressRepository extends JpaRepository<InstructionalProgress, UUID> {

    List<InstructionalProgress> findByUserId(UUID userId);

    Optional<InstructionalProgress> findByUserIdAndVideoId(UUID userId, UUID videoId);

    void deleteByUserIdAndVideoId(UUID userId, UUID videoId);
}
