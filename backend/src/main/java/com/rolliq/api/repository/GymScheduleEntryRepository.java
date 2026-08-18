package com.rolliq.api.repository;

import com.rolliq.api.model.GymScheduleEntry;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GymScheduleEntryRepository extends JpaRepository<GymScheduleEntry, UUID> {

    List<GymScheduleEntry> findByGymIdOrderByDayOfWeekAscStartTimeAsc(UUID gymId);

    Optional<GymScheduleEntry> findByIdAndGymId(UUID id, UUID gymId);
}
