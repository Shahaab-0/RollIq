package com.rolliq.api.repository;

import com.rolliq.api.model.Roll;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RollRepository extends JpaRepository<Roll, UUID> {

    List<Roll> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Roll> findByIdAndUserId(UUID id, UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);
}
