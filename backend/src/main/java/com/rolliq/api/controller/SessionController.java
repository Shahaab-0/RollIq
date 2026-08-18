package com.rolliq.api.controller;

import com.rolliq.api.dto.session.CreateSessionRequest;
import com.rolliq.api.dto.session.SessionResponse;
import com.rolliq.api.dto.session.SessionTechniquesRequest;
import com.rolliq.api.dto.session.UpdateSessionRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.SessionService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<SessionResponse> list() {
        return sessionService.list(currentUser.id());
    }

    @PostMapping
    public ResponseEntity<SessionResponse> create(@Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.create(currentUser.id(), request));
    }

    @PatchMapping("/{id}")
    public SessionResponse update(@PathVariable UUID id, @RequestBody UpdateSessionRequest request) {
        return sessionService.update(currentUser.id(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        sessionService.delete(currentUser.id(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/techniques")
    public List<UUID> getTechniques(@PathVariable UUID id) {
        return sessionService.getTechniqueIds(currentUser.id(), id);
    }

    @PutMapping("/{id}/techniques")
    public ResponseEntity<Void> replaceTechniques(
            @PathVariable UUID id, @RequestBody SessionTechniquesRequest request) {
        sessionService.replaceTechniques(currentUser.id(), id, request.techniqueIds());
        return ResponseEntity.noContent().build();
    }
}
