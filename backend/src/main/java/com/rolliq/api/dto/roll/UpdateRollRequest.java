package com.rolliq.api.dto.roll;

import java.util.List;
import java.util.UUID;

public record UpdateRollRequest(
        UUID sessionId,
        String partnerName,
        List<String> submissionsLanded,
        List<String> submissionsReceived,
        Integer escapes,
        Integer effortRating,
        String notes) {}
