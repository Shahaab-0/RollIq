package com.rolliq.api.repository;

import com.rolliq.api.model.GymClassAttendance;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GymClassAttendanceRepository extends JpaRepository<GymClassAttendance, UUID> {

    Optional<GymClassAttendance> findByGymClassEntryIdAndUserId(UUID gymClassEntryId, UUID userId);

    // Never falls back to email, same reasoning as GymMembershipRepository's
    // member list -- attendance is visible to any gym member, not just the
    // owner/trainer who marks it.
    @Query(
            value = """
            select
              gm.user_id as userId,
              coalesce(p.display_name, 'Member') as displayName,
              (gca.id is not null) as present
            from gym_memberships gm
            left join profiles p on p.id = gm.user_id
            left join gym_class_attendance gca
              on gca.user_id = gm.user_id and gca.gym_class_entry_id = :classId
            where gm.gym_id = :gymId
            order by gm.joined_at asc
            """,
            nativeQuery = true)
    List<GymAttendeeSummary> findRosterForClass(
            @Param("gymId") UUID gymId, @Param("classId") UUID classId);
}
