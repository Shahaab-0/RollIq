package com.rolliq.api.dto.roll;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RollResponse(
        UUID id,
        UUID sessionId,
        String partnerName,
        List<String> submissionsLanded,
        List<String> submissionsReceived,
        int escapes,
        Integer effortRating,
        String notes,
        Instant createdAt) {}
