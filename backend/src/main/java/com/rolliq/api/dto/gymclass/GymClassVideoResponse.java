package com.rolliq.api.dto.gymclass;

import java.util.List;
import java.util.UUID;

public record GymClassVideoResponse(
        UUID id, UUID gymClassEntryId, String url, List<String> techniques, int sequenceNumber) {}
