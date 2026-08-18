package com.rolliq.api.dto.gymclass;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateGymClassEntryRequest(
        @NotBlank String title, String description, @NotNull LocalDate classDate) {}
