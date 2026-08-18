package com.rolliq.api.repository;

import com.rolliq.api.model.Technique;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TechniqueRepository extends JpaRepository<Technique, UUID> {

    List<Technique> findByUserIdOrderByNameAsc(UUID userId);

    Optional<Technique> findByIdAndUserId(UUID id, UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);
}
