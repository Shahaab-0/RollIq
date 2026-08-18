package com.rolliq.api.repository;

import com.rolliq.api.model.Gym;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GymRepository extends JpaRepository<Gym, UUID> {

    Optional<Gym> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);

    // Inner-joining on gym_memberships for :userId both scopes the result to
    // "gyms I'm a member of" and yields myRole in the same row -- member and
    // class counts are separate subqueries since they must total across ALL
    // members/classes, not just this user's row.
    @Query(
            value = """
            select
              g.id as id, g.name as name, g.description as description,
              g.invite_code as inviteCode, g.created_at as createdAt,
              gm.role as myRole,
              (select count(*) from gym_memberships m2 where m2.gym_id = g.id) as memberCount,
              (select count(*) from gym_class_entries c2 where c2.gym_id = g.id) as classCount
            from gyms g
            join gym_memberships gm on gm.gym_id = g.id and gm.user_id = :userId
            order by g.name
            """,
            nativeQuery = true)
    List<GymSummary> findAllForUser(@Param("userId") UUID userId);
}
