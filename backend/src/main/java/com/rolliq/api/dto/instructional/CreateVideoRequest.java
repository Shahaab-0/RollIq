package com.rolliq.api.dto.instructional;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateVideoRequest(
        @NotBlank String title,
        @NotNull Integer sequenceNumber,
        String url,
        Integer durationMinutes) {}
