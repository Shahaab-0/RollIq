package com.rolliq.api.repository;

import com.rolliq.api.model.Injury;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InjuryRepository extends JpaRepository<Injury, UUID> {

    List<Injury> findByUserIdOrderByInjuryDateDesc(UUID userId);

    Optional<Injury> findByIdAndUserId(UUID id, UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);
}
