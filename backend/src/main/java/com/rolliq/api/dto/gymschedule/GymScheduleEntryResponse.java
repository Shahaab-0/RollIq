package com.rolliq.api.dto.gymschedule;

import java.time.LocalTime;
import java.util.UUID;

public record GymScheduleEntryResponse(
        UUID id, UUID gymId, int dayOfWeek, LocalTime startTime, LocalTime endTime, String topic) {}
