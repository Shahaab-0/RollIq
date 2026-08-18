package com.rolliq.api.dto.instructional;

import java.util.UUID;

public record InstructionalResponse(
        UUID id,
        String title,
        String instructor,
        String category,
        String difficulty,
        String platform,
        String url,
        String description,
        Integer releaseYear,
        long videoCount,
        long completedVideoCount,
        long inProgressVideoCount) {}
