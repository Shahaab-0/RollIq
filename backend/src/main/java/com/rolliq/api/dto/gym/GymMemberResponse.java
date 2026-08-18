package com.rolliq.api.dto.gym;

import java.time.Instant;
import java.util.UUID;

public record GymMemberResponse(UUID userId, String displayName, String role, Instant joinedAt) {}
