package com.rolliq.api.dto.gym;

import jakarta.validation.constraints.NotBlank;

public record JoinGymRequest(@NotBlank String inviteCode) {}
