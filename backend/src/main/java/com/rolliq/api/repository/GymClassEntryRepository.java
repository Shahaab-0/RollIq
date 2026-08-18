package com.rolliq.api.repository;

import com.rolliq.api.model.GymClassEntry;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GymClassEntryRepository extends JpaRepository<GymClassEntry, UUID> {

    Optional<GymClassEntry> findByIdAndGymId(UUID id, UUID gymId);

    long countByGymId(UUID gymId);

    @Query(
            value = """
            select
              c.id as id, c.gym_id as gymId, c.title as title, c.description as description,
              c.class_date as classDate,
              count(v.id) as videoCount
            from gym_class_entries c
            left join gym_class_videos v on v.gym_class_entry_id = c.id
            where c.gym_id = :gymId
            group by c.id, c.gym_id, c.title, c.description, c.class_date
            order by c.class_date desc
            """,
            nativeQuery = true)
    List<GymClassEntrySummary> findByGymIdWithVideoCount(@Param("gymId") UUID gymId);
}
