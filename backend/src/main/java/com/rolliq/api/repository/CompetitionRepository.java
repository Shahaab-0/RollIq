package com.rolliq.api.repository;

import com.rolliq.api.model.Competition;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CompetitionRepository extends JpaRepository<Competition, UUID> {

    Optional<Competition> findByIdAndUserId(UUID id, UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);

    @Query(
            value = """
            select
              c.id as id, c.name as name, c.competition_date as competitionDate,
              c.weight_category as weightCategory, c.belt_division as beltDivision,
              c.location as location, c.notes as notes,
              count(m.id) as matchCount,
              count(m.id) filter (where m.result = 'win') as wins,
              count(m.id) filter (where m.result = 'loss') as losses,
              count(m.id) filter (where m.result = 'draw') as draws
            from competitions c
            left join competition_matches m on m.competition_id = c.id
            where c.user_id = :userId
            group by c.id
            order by c.competition_date desc
            """,
            nativeQuery = true)
    List<CompetitionSummary> findAllForUser(@Param("userId") UUID userId);

    @Query(
            value = """
            select
              c.id as id, c.name as name, c.competition_date as competitionDate,
              c.weight_category as weightCategory, c.belt_division as beltDivision,
              c.location as location, c.notes as notes,
              count(m.id) as matchCount,
              count(m.id) filter (where m.result = 'win') as wins,
              count(m.id) filter (where m.result = 'loss') as losses,
              count(m.id) filter (where m.result = 'draw') as draws
            from competitions c
            left join competition_matches m on m.competition_id = c.id
            where c.id = :id and c.user_id = :userId
            group by c.id
            """,
            nativeQuery = true)
    Optional<CompetitionSummary> findSummaryByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
