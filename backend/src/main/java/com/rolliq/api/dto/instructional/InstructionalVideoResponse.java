package com.rolliq.api.dto.instructional;

import java.util.UUID;

public record InstructionalVideoResponse(
        UUID id,
        UUID instructionalId,
        String title,
        int sequenceNumber,
        String url,
        Integer durationMinutes) {}
