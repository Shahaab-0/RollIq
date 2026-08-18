package com.rolliq.api.dto.beltpromotion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

// Dedicated "log a past/new belt promotion" flow -- always resets stripes
// to 0 server-side, since that's what a real belt promotion does.
public record CreateBeltPromotionRequest(
        @NotBlank String belt, @NotNull LocalDate promotedOn, String notes) {}
