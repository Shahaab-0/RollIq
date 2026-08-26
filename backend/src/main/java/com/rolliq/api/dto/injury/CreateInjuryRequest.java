package com.rolliq.api.dto.injury;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateInjuryRequest(
        @NotBlank String bodyPart,
        @NotBlank String description,
        @NotNull LocalDate injuryDate,
        @NotBlank String severity,
        @NotBlank String status,
        String notes) {}
