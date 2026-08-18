package com.rolliq.api.controller;

import com.rolliq.api.dto.gym.CreateGymRequest;
import com.rolliq.api.dto.gym.GymResponse;
import com.rolliq.api.dto.gym.JoinGymRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.GymService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gyms")
@RequiredArgsConstructor
public class GymController {

    private final GymService gymService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<GymResponse> list() {
        return gymService.list(currentUser.id());
    }

    @PostMapping
    public ResponseEntity<GymResponse> create(@Valid @RequestBody CreateGymRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gymService.create(currentUser.id(), request));
    }

    @GetMapping("/{gymId}")
    public GymResponse get(@PathVariable UUID gymId) {
        return gymService.get(gymId, currentUser.id());
    }

    @PostMapping("/join")
    public GymResponse join(@Valid @RequestBody JoinGymRequest request) {
        return gymService.join(currentUser.id(), request);
    }
}
