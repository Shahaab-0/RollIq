package com.rolliq.api.repository;

import com.rolliq.api.model.Instructional;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InstructionalRepository extends JpaRepository<Instructional, UUID> {

    @Query(
            value = """
            select
              i.id as id, i.title as title, i.instructor as instructor, i.category as category,
              i.difficulty as difficulty,
              i.platform as platform, i.url as url, i.description as description,
              i.release_year as releaseYear,
              count(distinct v.id) as videoCount,
              count(distinct case when p.status = 'completed' then p.id end) as completedCount,
              count(distinct case when p.status = 'in_progress' then p.id end) as inProgressCount
            from instructionals i
            left join instructional_videos v on v.instructional_id = i.id
            left join instructional_progress p on p.video_id = v.id and p.user_id = :userId
            group by i.id, i.title, i.instructor, i.category, i.difficulty, i.platform, i.url, i.description, i.release_year
            order by i.title
            """,
            nativeQuery = true)
    List<InstructionalSummary> findAllWithProgressSummary(@Param("userId") UUID userId);
}
