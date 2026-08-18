package com.rolliq.api.dto.instructional;

import jakarta.validation.constraints.NotBlank;

public record UpdateProgressRequest(@NotBlank String status, String notes) {}
