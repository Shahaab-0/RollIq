package com.rolliq.api.repository;

import com.rolliq.api.model.GymMembership;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GymMembershipRepository extends JpaRepository<GymMembership, UUID> {

    Optional<GymMembership> findByGymIdAndUserId(UUID gymId, UUID userId);

    List<GymMembership> findByGymIdOrderByJoinedAtAsc(UUID gymId);

    boolean existsByGymIdAndUserId(UUID gymId, UUID userId);

    long countByGymId(UUID gymId);

    // displayName never falls back to the user's email -- unlike a plain
    // ownership check, gym membership doesn't imply consent to share your
    // account email with every other member of the gym. A member who
    // hasn't set a display name yet just shows as "Member" until they do.
    @Query(
            value = """
            select
              gm.user_id as userId, gm.role as role, gm.joined_at as joinedAt,
              coalesce(p.display_name, 'Member') as displayName
            from gym_memberships gm
            left join profiles p on p.id = gm.user_id
            where gm.gym_id = :gymId
            order by gm.joined_at asc
            """,
            nativeQuery = true)
    List<GymMemberSummary> findByGymIdWithProfile(@Param("gymId") UUID gymId);

    @Query(
            value = """
            select
              gm.user_id as userId, gm.role as role, gm.joined_at as joinedAt,
              coalesce(p.display_name, 'Member') as displayName
            from gym_memberships gm
            left join profiles p on p.id = gm.user_id
            where gm.gym_id = :gymId and gm.user_id = :userId
            """,
            nativeQuery = true)
    Optional<GymMemberSummary> findByGymIdAndUserIdWithProfile(
            @Param("gymId") UUID gymId, @Param("userId") UUID userId);
}
