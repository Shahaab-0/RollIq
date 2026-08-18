package com.rolliq.api.service;

import com.rolliq.api.dto.session.CreateSessionRequest;
import com.rolliq.api.dto.session.SessionResponse;
import com.rolliq.api.dto.session.UpdateSessionRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.SessionTechnique;
import com.rolliq.api.model.Technique;
import com.rolliq.api.model.TrainingSession;
import com.rolliq.api.repository.SessionTechniqueRepository;
import com.rolliq.api.repository.TechniqueRepository;
import com.rolliq.api.repository.TrainingSessionRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final TrainingSessionRepository sessionRepository;
    private final SessionTechniqueRepository sessionTechniqueRepository;
    private final TechniqueRepository techniqueRepository;

    public List<SessionResponse> list(UUID userId) {
        return sessionRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SessionResponse create(UUID userId, CreateSessionRequest request) {
        TrainingSession session = new TrainingSession();
        session.setUserId(userId);
        session.setDate(request.date());
        session.setGi(request.gi());
        session.setDurationMinutes(request.durationMinutes());
        session.setSessionType(request.sessionType());
        session.setInstructor(request.instructor());
        session.setNotes(request.notes());
        session.setRoundsCount(request.roundsCount());
        session.setRoundMinutes(request.roundMinutes());
        session.setProductivityRating(request.productivityRating());
        session.setSubmissionsLandedCount(request.submissionsLandedCount());
        return toResponse(sessionRepository.save(session));
    }

    @Transactional
    public SessionResponse update(UUID userId, UUID id, UpdateSessionRequest request) {
        TrainingSession session = findOwned(userId, id);
        if (request.date() != null) session.setDate(request.date());
        if (request.gi() != null) session.setGi(request.gi());
        if (request.durationMinutes() != null) session.setDurationMinutes(request.durationMinutes());
        if (request.sessionType() != null) session.setSessionType(request.sessionType());
        if (request.instructor() != null) session.setInstructor(request.instructor());
        if (request.notes() != null) session.setNotes(request.notes());
        if (request.roundsCount() != null) session.setRoundsCount(request.roundsCount());
        if (request.roundMinutes() != null) session.setRoundMinutes(request.roundMinutes());
        if (request.productivityRating() != null) {
            session.setProductivityRating(request.productivityRating());
        }
        if (request.submissionsLandedCount() != null) {
            session.setSubmissionsLandedCount(request.submissionsLandedCount());
        }
        return toResponse(sessionRepository.save(session));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        sessionRepository.deleteByIdAndUserId(id, userId);
    }

    public List<UUID> getTechniqueIds(UUID userId, UUID sessionId) {
        findOwned(userId, sessionId);
        return sessionTechniqueRepository.findByIdSessionIdAndUserId(sessionId, userId).stream()
                .map(link -> link.getId().getTechniqueId())
                .toList();
    }

    @Transactional
    public void replaceTechniques(UUID userId, UUID sessionId, List<UUID> techniqueIds) {
        findOwned(userId, sessionId);
        sessionTechniqueRepository.deleteByIdSessionIdAndUserId(sessionId, userId);

        if (techniqueIds == null || techniqueIds.isEmpty()) return;

        List<Technique> owned = techniqueRepository.findAllById(techniqueIds);
        boolean allOwnedByUser = owned.size() == techniqueIds.size()
                && owned.stream().allMatch(t -> t.getUserId().equals(userId));
        if (!allOwnedByUser) {
            throw ApiException.badRequest("One or more techniques do not belong to this user");
        }

        List<SessionTechnique> links = techniqueIds.stream()
                .map(techniqueId -> new SessionTechnique(sessionId, techniqueId, userId))
                .toList();
        sessionTechniqueRepository.saveAll(links);
    }

    private TrainingSession findOwned(UUID userId, UUID id) {
        return sessionRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Session not found"));
    }

    private SessionResponse toResponse(TrainingSession session) {
        return new SessionResponse(
                session.getId(),
                session.getDate(),
                session.isGi(),
                session.getDurationMinutes(),
                session.getSessionType(),
                session.getInstructor(),
                session.getNotes(),
                session.getRoundsCount(),
                session.getRoundMinutes(),
                session.getProductivityRating(),
                session.getSubmissionsLandedCount());
    }
}
