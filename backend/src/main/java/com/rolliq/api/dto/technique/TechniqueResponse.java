package com.rolliq.api.dto.technique;

import java.util.UUID;

public record TechniqueResponse(
        UUID id,
        String name,
        String position,
        String notes,
        String resourceUrl,
        int drillCount) {}
