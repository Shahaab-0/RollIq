package com.rolliq.api.service;

import com.rolliq.api.dto.competition.CompetitionResponse;
import com.rolliq.api.dto.competition.CreateCompetitionRequest;
import com.rolliq.api.dto.competition.UpdateCompetitionRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.Competition;
import com.rolliq.api.repository.CompetitionRepository;
import com.rolliq.api.repository.CompetitionSummary;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompetitionService {

    private final CompetitionRepository competitionRepository;

    public List<CompetitionResponse> list(UUID userId) {
        return competitionRepository.findAllForUser(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CompetitionResponse create(UUID userId, CreateCompetitionRequest request) {
        Competition competition = new Competition();
        competition.setUserId(userId);
        competition.setName(request.name());
        competition.setCompetitionDate(request.competitionDate());
        competition.setWeightCategory(request.weightCategory());
        competition.setBeltDivision(request.beltDivision());
        competition.setLocation(request.location());
        competition.setNotes(request.notes());
        Competition saved = competitionRepository.save(competition);
        return toResponse(saved, 0, 0, 0, 0);
    }

    @Transactional
    public CompetitionResponse update(UUID userId, UUID id, UpdateCompetitionRequest request) {
        Competition competition = findOwned(userId, id);
        if (request.name() != null) competition.setName(request.name());
        if (request.competitionDate() != null) {
            competition.setCompetitionDate(request.competitionDate());
        }
        if (request.weightCategory() != null) competition.setWeightCategory(request.weightCategory());
        if (request.beltDivision() != null) competition.setBeltDivision(request.beltDivision());
        if (request.location() != null) competition.setLocation(request.location());
        if (request.notes() != null) competition.setNotes(request.notes());
        competitionRepository.save(competition);
        return toResponse(competitionRepository
                .findSummaryByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Competition not found")));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        competitionRepository.deleteByIdAndUserId(id, userId);
    }

    Competition findOwned(UUID userId, UUID id) {
        return competitionRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Competition not found"));
    }

    private CompetitionResponse toResponse(CompetitionSummary summary) {
        return new CompetitionResponse(
                summary.getId(),
                summary.getName(),
                summary.getCompetitionDate(),
                summary.getWeightCategory(),
                summary.getBeltDivision(),
                summary.getLocation(),
                summary.getNotes(),
                summary.getMatchCount(),
                summary.getWins(),
                summary.getLosses(),
                summary.getDraws());
    }

    private CompetitionResponse toResponse(
            Competition competition, long matchCount, long wins, long losses, long draws) {
        return new CompetitionResponse(
                competition.getId(),
                competition.getName(),
                competition.getCompetitionDate(),
                competition.getWeightCategory(),
                competition.getBeltDivision(),
                competition.getLocation(),
                competition.getNotes(),
                matchCount,
                wins,
                losses,
                draws);
    }
}
