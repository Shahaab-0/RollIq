package com.rolliq.api.dto.competition;

public record UpdateCompetitionMatchRequest(
        String opponentName, String result, String method, Integer matchOrder, String notes) {}
