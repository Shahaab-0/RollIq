package com.rolliq.api.controller;

import com.rolliq.api.dto.competition.CompetitionMatchResponse;
import com.rolliq.api.dto.competition.CreateCompetitionMatchRequest;
import com.rolliq.api.dto.competition.UpdateCompetitionMatchRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.CompetitionMatchService;
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
@RequestMapping("/api/v1/competitions/{competitionId}/matches")
@RequiredArgsConstructor
public class CompetitionMatchController {

    private final CompetitionMatchService matchService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<CompetitionMatchResponse> list(@PathVariable UUID competitionId) {
        return matchService.list(competitionId, currentUser.id());
    }

    @PostMapping
    public ResponseEntity<CompetitionMatchResponse> create(
            @PathVariable UUID competitionId, @Valid @RequestBody CreateCompetitionMatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matchService.create(competitionId, currentUser.id(), request));
    }

    @PatchMapping("/{matchId}")
    public CompetitionMatchResponse update(
            @PathVariable UUID competitionId,
            @PathVariable UUID matchId,
            @RequestBody UpdateCompetitionMatchRequest request) {
        return matchService.update(competitionId, matchId, currentUser.id(), request);
    }

    @DeleteMapping("/{matchId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID competitionId, @PathVariable UUID matchId) {
        matchService.delete(competitionId, matchId, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
