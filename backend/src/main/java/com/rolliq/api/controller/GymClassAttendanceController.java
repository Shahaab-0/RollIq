package com.rolliq.api.controller;

import com.rolliq.api.dto.gymclass.GymAttendeeResponse;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.GymClassAttendanceService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gyms/{gymId}/classes/{classId}/attendance")
@RequiredArgsConstructor
public class GymClassAttendanceController {

    private final GymClassAttendanceService attendanceService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<GymAttendeeResponse> list(@PathVariable UUID gymId, @PathVariable UUID classId) {
        return attendanceService.list(gymId, classId, currentUser.id());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Void> mark(
            @PathVariable UUID gymId, @PathVariable UUID classId, @PathVariable UUID userId) {
        attendanceService.mark(gymId, classId, userId, currentUser.id());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unmark(
            @PathVariable UUID gymId, @PathVariable UUID classId, @PathVariable UUID userId) {
        attendanceService.unmark(gymId, classId, userId, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
