package com.rolliq.api.dto.competition;

import jakarta.validation.constraints.NotBlank;

public record CreateCompetitionMatchRequest(
        @NotBlank String opponentName,
        @NotBlank String result,
        String method,
        int matchOrder,
        String notes) {}
