package com.rolliq.api.dto.instructional;

import java.util.UUID;

public record InstructionalProgressResponse(UUID videoId, String status, String notes) {}
