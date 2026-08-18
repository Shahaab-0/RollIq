package com.rolliq.api.dto.session;

import java.time.LocalDate;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        LocalDate date,
        boolean gi,
        Integer durationMinutes,
        String sessionType,
        String instructor,
        String notes,
        Integer roundsCount,
        Integer roundMinutes,
        Integer productivityRating,
        Integer submissionsLandedCount) {}
