package com.rolliq.api.dto.session;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateSessionRequest(
        @NotNull LocalDate date,
        boolean gi,
        Integer durationMinutes,
        @NotBlank String sessionType,
        String instructor,
        String notes,
        Integer roundsCount,
        Integer roundMinutes,
        Integer productivityRating,
        Integer submissionsLandedCount) {}
