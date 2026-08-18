package com.rolliq.api.dto.gym;

import jakarta.validation.constraints.NotBlank;

public record CreateGymRequest(@NotBlank String name, String description) {}
