package com.rolliq.api.repository;

import java.time.Instant;
import java.util.UUID;

// Projection joining gym_memberships to profiles/users so member lists can
// show a real name instead of a bare user id -- falls back to the user's
// email when they haven't set a display name.
public interface GymMemberSummary {

    UUID getUserId();

    String getDisplayName();

    String getRole();

    Instant getJoinedAt();
}
