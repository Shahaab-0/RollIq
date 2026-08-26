package com.rolliq.api.service;

import com.rolliq.api.dto.competition.CompetitionMatchResponse;
import com.rolliq.api.dto.competition.CreateCompetitionMatchRequest;
import com.rolliq.api.dto.competition.UpdateCompetitionMatchRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.CompetitionMatch;
import com.rolliq.api.repository.CompetitionMatchRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompetitionMatchService {

    private static final Set<String> VALID_RESULTS = Set.of("win", "loss", "draw");

    private final CompetitionMatchRepository matchRepository;
    private final CompetitionService competitionService;

    public List<CompetitionMatchResponse> list(UUID competitionId, UUID userId) {
        competitionService.findOwned(userId, competitionId);
        return matchRepository.findByCompetitionIdOrderByMatchOrderAsc(competitionId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CompetitionMatchResponse create(
            UUID competitionId, UUID userId, CreateCompetitionMatchRequest request) {
        competitionService.findOwned(userId, competitionId);
        requireValidResult(request.result());
        CompetitionMatch match = new CompetitionMatch();
        match.setCompetitionId(competitionId);
        match.setOpponentName(request.opponentName());
        match.setResult(request.result());
        match.setMethod(request.method());
        match.setMatchOrder(request.matchOrder());
        match.setNotes(request.notes());
        return toResponse(matchRepository.save(match));
    }

    @Transactional
    public CompetitionMatchResponse update(
            UUID competitionId, UUID matchId, UUID userId, UpdateCompetitionMatchRequest request) {
        competitionService.findOwned(userId, competitionId);
        CompetitionMatch match = findInCompetition(competitionId, matchId);
        if (request.opponentName() != null) match.setOpponentName(request.opponentName());
        if (request.result() != null) {
            requireValidResult(request.result());
            match.setResult(request.result());
        }
        if (request.method() != null) match.setMethod(request.method());
        if (request.matchOrder() != null) match.setMatchOrder(request.matchOrder());
        if (request.notes() != null) match.setNotes(request.notes());
        return toResponse(matchRepository.save(match));
    }

    @Transactional
    public void delete(UUID competitionId, UUID matchId, UUID userId) {
        competitionService.findOwned(userId, competitionId);
        matchRepository.deleteByIdAndCompetitionId(matchId, competitionId);
    }

    private CompetitionMatch findInCompetition(UUID competitionId, UUID matchId) {
        return matchRepository
                .findByIdAndCompetitionId(matchId, competitionId)
                .orElseThrow(() -> ApiException.notFound("Match not found"));
    }

    private void requireValidResult(String result) {
        if (!VALID_RESULTS.contains(result)) {
            throw ApiException.badRequest("Invalid result: " + result);
        }
    }

    private CompetitionMatchResponse toResponse(CompetitionMatch match) {
        return new CompetitionMatchResponse(
                match.getId(),
                match.getCompetitionId(),
                match.getOpponentName(),
                match.getResult(),
                match.getMethod(),
                match.getMatchOrder(),
                match.getNotes());
    }
}
