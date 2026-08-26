package com.rolliq.api.dto.competition;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateCompetitionRequest(
        @NotBlank String name,
        @NotNull LocalDate competitionDate,
        @NotBlank String weightCategory,
        String beltDivision,
        String location,
        String notes) {}
