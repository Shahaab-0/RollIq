package com.rolliq.api.controller;

import com.rolliq.api.dto.instructional.InstructionalProgressResponse;
import com.rolliq.api.dto.instructional.UpdateProgressRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.InstructionalProgressService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/instructional-progress")
@RequiredArgsConstructor
public class InstructionalProgressController {

    private final InstructionalProgressService progressService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<InstructionalProgressResponse> list() {
        return progressService.listForUser(currentUser.id());
    }

    @PutMapping("/{videoId}")
    public InstructionalProgressResponse upsert(
            @PathVariable UUID videoId, @Valid @RequestBody UpdateProgressRequest request) {
        return progressService.upsert(currentUser.id(), videoId, request);
    }

    @DeleteMapping("/{videoId}")
    public ResponseEntity<Void> delete(@PathVariable UUID videoId) {
        progressService.delete(currentUser.id(), videoId);
        return ResponseEntity.noContent().build();
    }
}
