package com.rolliq.api.repository;

import java.util.UUID;

// Projection for GymClassAttendanceRepository.findRosterForClass -- every
// gym member, joined against whether they're marked present on a specific
// class, so the trainer UI can render a full roster with checkboxes rather
// than just a list of who's already been marked.
public interface GymAttendeeSummary {

    UUID getUserId();

    String getDisplayName();

    boolean getPresent();
}
