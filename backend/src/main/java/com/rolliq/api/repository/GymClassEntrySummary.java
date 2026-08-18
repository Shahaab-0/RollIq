package com.rolliq.api.repository;

import java.time.LocalDate;
import java.util.UUID;

// Projection for GymClassEntryRepository.findByGymIdWithVideoCount -- video
// counts aggregated in the query itself, same N+1-avoidance reasoning as
// GymSummary/InstructionalSummary.
public interface GymClassEntrySummary {

    UUID getId();

    UUID getGymId();

    String getTitle();

    String getDescription();

    LocalDate getClassDate();

    Long getVideoCount();
}
