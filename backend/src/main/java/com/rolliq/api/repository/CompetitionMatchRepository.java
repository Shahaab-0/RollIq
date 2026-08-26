package com.rolliq.api.repository;

import com.rolliq.api.model.CompetitionMatch;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompetitionMatchRepository extends JpaRepository<CompetitionMatch, UUID> {

    List<CompetitionMatch> findByCompetitionIdOrderByMatchOrderAsc(UUID competitionId);

    Optional<CompetitionMatch> findByIdAndCompetitionId(UUID id, UUID competitionId);

    void deleteByIdAndCompetitionId(UUID id, UUID competitionId);
}
