package com.rolliq.api.dto.injury;

import java.time.LocalDate;

public record UpdateInjuryRequest(
        String bodyPart,
        String description,
        LocalDate injuryDate,
        String severity,
        String status,
        String notes) {}
