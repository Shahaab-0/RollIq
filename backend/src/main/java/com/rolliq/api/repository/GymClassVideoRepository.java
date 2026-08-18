package com.rolliq.api.repository;

import com.rolliq.api.model.GymClassVideo;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GymClassVideoRepository extends JpaRepository<GymClassVideo, UUID> {

    List<GymClassVideo> findByGymClassEntryIdOrderBySequenceNumberAsc(UUID gymClassEntryId);

    Optional<GymClassVideo> findByIdAndGymClassEntryId(UUID id, UUID gymClassEntryId);
}
