package com.rolliq.api.dto.gymclass;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateGymClassVideoRequest(
        String url, List<String> techniques, @NotNull Integer sequenceNumber) {}
