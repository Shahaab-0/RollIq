package com.rolliq.api.dto.injury;

import java.time.LocalDate;
import java.util.UUID;

public record InjuryResponse(
        UUID id,
        String bodyPart,
        String description,
        LocalDate injuryDate,
        String severity,
        String status,
        String notes) {}
