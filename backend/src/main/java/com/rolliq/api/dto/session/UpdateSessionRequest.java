package com.rolliq.api.dto.session;

import java.time.LocalDate;

public record UpdateSessionRequest(
        LocalDate date,
        Boolean gi,
        Integer durationMinutes,
        String sessionType,
        String instructor,
        String notes,
        Integer roundsCount,
        Integer roundMinutes,
        Integer productivityRating,
        Integer submissionsLandedCount) {}
