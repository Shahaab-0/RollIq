package com.rolliq.api.service;

import com.rolliq.api.dto.gymschedule.CreateGymScheduleEntryRequest;
import com.rolliq.api.dto.gymschedule.GymScheduleEntryResponse;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.GymScheduleEntry;
import com.rolliq.api.repository.GymScheduleEntryRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GymScheduleEntryService {

    private final GymScheduleEntryRepository scheduleRepository;
    private final GymAccessService gymAccessService;

    public List<GymScheduleEntryResponse> list(UUID gymId, UUID userId) {
        gymAccessService.requireMembership(gymId, userId);
        return scheduleRepository.findByGymIdOrderByDayOfWeekAscStartTimeAsc(gymId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GymScheduleEntryResponse create(
            UUID gymId, UUID userId, CreateGymScheduleEntryRequest request) {
        gymAccessService.requireTrainerOrOwner(gymId, userId);
        if (!request.endTime().isAfter(request.startTime())) {
            throw ApiException.badRequest("End time must be after start time");
        }
        GymScheduleEntry entry = new GymScheduleEntry();
        entry.setGymId(gymId);
        entry.setDayOfWeek(request.dayOfWeek());
        entry.setStartTime(request.startTime());
        entry.setEndTime(request.endTime());
        entry.setTopic(request.topic());
        entry.setCreatedBy(userId);
        return toResponse(scheduleRepository.save(entry));
    }

    @Transactional
    public void delete(UUID gymId, UUID entryId, UUID userId) {
        gymAccessService.requireTrainerOrOwner(gymId, userId);
        GymScheduleEntry entry =
                scheduleRepository
                        .findByIdAndGymId(entryId, gymId)
                        .orElseThrow(() -> ApiException.notFound("Schedule entry not found"));
        scheduleRepository.delete(entry);
    }

    private GymScheduleEntryResponse toResponse(GymScheduleEntry entry) {
        return new GymScheduleEntryResponse(
                entry.getId(),
                entry.getGymId(),
                entry.getDayOfWeek(),
                entry.getStartTime(),
                entry.getEndTime(),
                entry.getTopic());
    }
}
