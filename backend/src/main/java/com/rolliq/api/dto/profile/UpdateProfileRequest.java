package com.rolliq.api.dto.profile;

// Partial update: a null field means "leave unchanged", matching the RN
// client which only ever includes the keys it actually wants to change.
public record UpdateProfileRequest(
        String displayName,
        String currentBelt,
        Integer currentStripes,
        String homeGym) {}
