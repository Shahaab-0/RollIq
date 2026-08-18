package com.rolliq.api.controller;

import com.rolliq.api.dto.gymschedule.CreateGymScheduleEntryRequest;
import com.rolliq.api.dto.gymschedule.GymScheduleEntryResponse;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.GymScheduleEntryService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gyms/{gymId}/schedule")
@RequiredArgsConstructor
public class GymScheduleEntryController {

    private final GymScheduleEntryService scheduleService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<GymScheduleEntryResponse> list(@PathVariable UUID gymId) {
        return scheduleService.list(gymId, currentUser.id());
    }

    @PostMapping
    public ResponseEntity<GymScheduleEntryResponse> create(
            @PathVariable UUID gymId, @Valid @RequestBody CreateGymScheduleEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(scheduleService.create(gymId, currentUser.id(), request));
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> delete(@PathVariable UUID gymId, @PathVariable UUID entryId) {
        scheduleService.delete(gymId, entryId, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
