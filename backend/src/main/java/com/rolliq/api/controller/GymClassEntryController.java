package com.rolliq.api.controller;

import com.rolliq.api.dto.gymclass.CreateGymClassEntryRequest;
import com.rolliq.api.dto.gymclass.GymClassEntryResponse;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.GymClassEntryService;
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
@RequestMapping("/api/v1/gyms/{gymId}/classes")
@RequiredArgsConstructor
public class GymClassEntryController {

    private final GymClassEntryService classEntryService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<GymClassEntryResponse> list(@PathVariable UUID gymId) {
        return classEntryService.list(gymId, currentUser.id());
    }

    @PostMapping
    public ResponseEntity<GymClassEntryResponse> create(
            @PathVariable UUID gymId, @Valid @RequestBody CreateGymClassEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(classEntryService.create(gymId, currentUser.id(), request));
    }

    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> delete(@PathVariable UUID gymId, @PathVariable UUID classId) {
        classEntryService.delete(gymId, classId, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
