package com.rolliq.api.service;

import com.rolliq.api.dto.roll.CreateRollRequest;
import com.rolliq.api.dto.roll.PartnerHistoryResponse;
import com.rolliq.api.dto.roll.RollResponse;
import com.rolliq.api.dto.roll.UpdateRollRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.Roll;
import com.rolliq.api.repository.PartnerHistorySummary;
import com.rolliq.api.repository.RollRepository;
import com.rolliq.api.repository.TrainingSessionRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RollService {

    private final RollRepository rollRepository;
    private final TrainingSessionRepository sessionRepository;

    public List<RollResponse> list(UUID userId) {
        return rollRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PartnerHistoryResponse> partnerHistory(UUID userId) {
        return rollRepository.findPartnerHistory(userId).stream()
                .map(this::toPartnerHistoryResponse)
                .toList();
    }

    @Transactional
    public RollResponse create(UUID userId, CreateRollRequest request) {
        requireOwnedSessionIfPresent(userId, request.sessionId());
        Roll roll = new Roll();
        roll.setUserId(userId);
        roll.setSessionId(request.sessionId());
        roll.setPartnerName(request.partnerName());
        if (request.submissionsLanded() != null) {
            roll.setSubmissionsLanded(new ArrayList<>(request.submissionsLanded()));
        }
        if (request.submissionsReceived() != null) {
            roll.setSubmissionsReceived(new ArrayList<>(request.submissionsReceived()));
        }
        if (request.escapes() != null) roll.setEscapes(request.escapes());
        roll.setEffortRating(request.effortRating());
        roll.setNotes(request.notes());
        return toResponse(rollRepository.save(roll));
    }

    @Transactional
    public RollResponse update(UUID userId, UUID id, UpdateRollRequest request) {
        Roll roll = findOwned(userId, id);
        if (request.sessionId() != null) {
            requireOwnedSessionIfPresent(userId, request.sessionId());
            roll.setSessionId(request.sessionId());
        }
        if (request.partnerName() != null) roll.setPartnerName(request.partnerName());
        if (request.submissionsLanded() != null) {
            roll.setSubmissionsLanded(new ArrayList<>(request.submissionsLanded()));
        }
        if (request.submissionsReceived() != null) {
            roll.setSubmissionsReceived(new ArrayList<>(request.submissionsReceived()));
        }
        if (request.escapes() != null) roll.setEscapes(request.escapes());
        if (request.effortRating() != null) roll.setEffortRating(request.effortRating());
        if (request.notes() != null) roll.setNotes(request.notes());
        return toResponse(rollRepository.save(roll));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        rollRepository.deleteByIdAndUserId(id, userId);
    }

    private Roll findOwned(UUID userId, UUID id) {
        return rollRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Roll not found"));
    }

    // A roll's session_id is an optional cross-link, not something the
    // client should be able to point at another user's session -- same
    // ownership-check reasoning as SessionService.replaceTechniques.
    private void requireOwnedSessionIfPresent(UUID userId, UUID sessionId) {
        if (sessionId == null) return;
        if (sessionRepository.findByIdAndUserId(sessionId, userId).isEmpty()) {
            throw ApiException.badRequest("Session does not belong to this user");
        }
    }

    private PartnerHistoryResponse toPartnerHistoryResponse(PartnerHistorySummary summary) {
        return new PartnerHistoryResponse(
                summary.getPartnerName(),
                summary.getRollCount(),
                summary.getLandedTotal(),
                summary.getReceivedTotal());
    }

    private RollResponse toResponse(Roll roll) {
        return new RollResponse(
                roll.getId(),
                roll.getSessionId(),
                roll.getPartnerName(),
                roll.getSubmissionsLanded(),
                roll.getSubmissionsReceived(),
                roll.getEscapes(),
                roll.getEffortRating(),
                roll.getNotes(),
                roll.getCreatedAt());
    }
}
