package com.rolliq.api.dto.beltpromotion;

import java.time.LocalDate;
import java.util.UUID;

public record BeltPromotionResponse(
        UUID id, String belt, int stripes, LocalDate promotedOn, String notes) {}
