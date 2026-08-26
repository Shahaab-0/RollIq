package com.rolliq.api.dto.technique;

import jakarta.validation.constraints.NotBlank;

public record ImportTechniqueSeed(
        @NotBlank String name, @NotBlank String position, String notes, String resourceUrl) {}
