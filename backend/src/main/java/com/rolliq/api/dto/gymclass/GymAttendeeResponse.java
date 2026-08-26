package com.rolliq.api.dto.gymclass;

import java.util.UUID;

public record GymAttendeeResponse(UUID userId, String displayName, boolean present) {}
