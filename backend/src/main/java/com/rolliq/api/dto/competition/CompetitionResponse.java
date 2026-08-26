package com.rolliq.api.dto.competition;

import java.time.LocalDate;
import java.util.UUID;

public record CompetitionResponse(
        UUID id,
        String name,
        LocalDate competitionDate,
        String weightCategory,
        String beltDivision,
        String location,
        String notes,
        long matchCount,
        long wins,
        long losses,
        long draws) {}
