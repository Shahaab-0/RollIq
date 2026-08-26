package com.rolliq.api.repository;

import com.rolliq.api.model.GymScheduleEntry;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GymScheduleEntryRepository extends JpaRepository<GymScheduleEntry, UUID> {

    List<GymScheduleEntry> findByGymIdOrderByDayOfWeekAscStartTimeAsc(UUID gymId);

    Optional<GymScheduleEntry> findByIdAndGymId(UUID id, UUID gymId);

    // Candidates for the upcoming-class-reminder job: today's day-of-week,
    // starting within the given window, not already reminded today.
    @Query(
            "select e from GymScheduleEntry e where e.dayOfWeek = :dayOfWeek "
                    + "and e.startTime between :windowStart and :windowEnd "
                    + "and (e.lastRemindedOn is null or e.lastRemindedOn <> :today)")
    List<GymScheduleEntry> findDueForReminder(
            @Param("dayOfWeek") int dayOfWeek,
            @Param("windowStart") LocalTime windowStart,
            @Param("windowEnd") LocalTime windowEnd,
            @Param("today") LocalDate today);
}
