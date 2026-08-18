package com.rolliq.api.dto.instructional;

import jakarta.validation.constraints.NotBlank;

public record CreateInstructionalRequest(
        @NotBlank String title,
        @NotBlank String instructor,
        @NotBlank String category,
        @NotBlank String difficulty,
        String platform,
        String url,
        String description,
        Integer releaseYear) {}
