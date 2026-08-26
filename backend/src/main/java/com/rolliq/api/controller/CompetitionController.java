package com.rolliq.api.controller;

import com.rolliq.api.dto.competition.CompetitionResponse;
import com.rolliq.api.dto.competition.CreateCompetitionRequest;
import com.rolliq.api.dto.competition.UpdateCompetitionRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.CompetitionService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/competitions")
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionService competitionService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<CompetitionResponse> list() {
        return competitionService.list(currentUser.id());
    }

    @PostMapping
    public ResponseEntity<CompetitionResponse> create(
            @Valid @RequestBody CreateCompetitionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(competitionService.create(currentUser.id(), request));
    }

    @PatchMapping("/{id}")
    public CompetitionResponse update(
            @PathVariable UUID id, @RequestBody UpdateCompetitionRequest request) {
        return competitionService.update(currentUser.id(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        competitionService.delete(currentUser.id(), id);
        return ResponseEntity.noContent().build();
    }
}
