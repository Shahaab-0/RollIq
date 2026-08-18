package com.rolliq.api.controller;

import com.rolliq.api.dto.gymclass.CreateGymClassVideoRequest;
import com.rolliq.api.dto.gymclass.GymClassVideoResponse;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.GymClassVideoService;
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
@RequestMapping("/api/v1/gyms/{gymId}/classes/{classId}/videos")
@RequiredArgsConstructor
public class GymClassVideoController {

    private final GymClassVideoService videoService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<GymClassVideoResponse> list(@PathVariable UUID gymId, @PathVariable UUID classId) {
        return videoService.list(gymId, classId, currentUser.id());
    }

    @PostMapping
    public ResponseEntity<GymClassVideoResponse> create(
            @PathVariable UUID gymId,
            @PathVariable UUID classId,
            @Valid @RequestBody CreateGymClassVideoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(videoService.create(gymId, classId, currentUser.id(), request));
    }

    @DeleteMapping("/{videoId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID gymId, @PathVariable UUID classId, @PathVariable UUID videoId) {
        videoService.delete(gymId, classId, videoId, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
