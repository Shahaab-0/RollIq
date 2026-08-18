package com.rolliq.api.repository;

import java.time.Instant;
import java.util.UUID;

// Projection for GymRepository.findAllForUser -- member/class counts are
// aggregated in the query itself so listing "my gyms" doesn't need an N+1
// fetch per gym, same reasoning as InstructionalSummary.
public interface GymSummary {

    UUID getId();

    String getName();

    String getDescription();

    String getInviteCode();

    Instant getCreatedAt();

    String getMyRole();

    Long getMemberCount();

    Long getClassCount();
}
