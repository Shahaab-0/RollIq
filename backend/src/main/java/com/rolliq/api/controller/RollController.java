package com.rolliq.api.controller;

import com.rolliq.api.dto.roll.CreateRollRequest;
import com.rolliq.api.dto.roll.RollResponse;
import com.rolliq.api.dto.roll.UpdateRollRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.RollService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rolls")
@RequiredArgsConstructor
public class RollController {

    private final RollService rollService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<RollResponse> list() {
        return rollService.list(currentUser.id());
    }

    @PostMapping
    public ResponseEntity<RollResponse> create(@RequestBody CreateRollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rollService.create(currentUser.id(), request));
    }

    @PatchMapping("/{id}")
    public RollResponse update(@PathVariable UUID id, @RequestBody UpdateRollRequest request) {
        return rollService.update(currentUser.id(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        rollService.delete(currentUser.id(), id);
        return ResponseEntity.noContent().build();
    }
}
