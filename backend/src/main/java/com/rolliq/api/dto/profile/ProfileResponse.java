package com.rolliq.api.dto.profile;

import java.util.UUID;

public record ProfileResponse(
        UUID id,
        String displayName,
        String currentBelt,
        int currentStripes,
        String homeGym) {}
