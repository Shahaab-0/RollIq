package com.rolliq.api.dto.gym;

import java.time.Instant;
import java.util.UUID;

public record GymResponse(
        UUID id,
        String name,
        String description,
        String inviteCode,
        Instant createdAt,
        String myRole,
        long memberCount,
        long classCount) {}
