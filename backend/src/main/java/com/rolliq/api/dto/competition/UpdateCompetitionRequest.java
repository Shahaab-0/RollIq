package com.rolliq.api.dto.competition;

import java.time.LocalDate;

public record UpdateCompetitionRequest(
        String name,
        LocalDate competitionDate,
        String weightCategory,
        String beltDivision,
        String location,
        String notes) {}
