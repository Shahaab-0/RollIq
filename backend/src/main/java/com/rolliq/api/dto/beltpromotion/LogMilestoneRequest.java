package com.rolliq.api.dto.beltpromotion;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

// Auto-log from the main Profile "Save Changes" flow -- does not touch
// profiles itself, since the caller already updates the profile directly.
public record LogMilestoneRequest(
        @NotBlank String belt, int stripes, LocalDate promotedOn) {}
