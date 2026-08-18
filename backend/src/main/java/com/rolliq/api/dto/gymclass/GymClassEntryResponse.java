package com.rolliq.api.dto.gymclass;

import java.time.LocalDate;
import java.util.UUID;

public record GymClassEntryResponse(
        UUID id,
        UUID gymId,
        String title,
        String description,
        LocalDate classDate,
        long videoCount) {}
