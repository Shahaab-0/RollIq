package com.rolliq.api.dto.competition;

import java.util.UUID;

public record CompetitionMatchResponse(
        UUID id,
        UUID competitionId,
        String opponentName,
        String result,
        String method,
        int matchOrder,
        String notes) {}
