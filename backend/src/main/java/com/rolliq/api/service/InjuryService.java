package com.rolliq.api.service;

import com.rolliq.api.dto.injury.CreateInjuryRequest;
import com.rolliq.api.dto.injury.InjuryResponse;
import com.rolliq.api.dto.injury.UpdateInjuryRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.Injury;
import com.rolliq.api.repository.InjuryRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InjuryService {

    private static final Set<String> VALID_SEVERITIES = Set.of("mild", "moderate", "severe");
    private static final Set<String> VALID_STATUSES = Set.of("active", "recovering", "resolved");

    private final InjuryRepository injuryRepository;

    public List<InjuryResponse> list(UUID userId) {
        return injuryRepository.findByUserIdOrderByInjuryDateDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public InjuryResponse create(UUID userId, CreateInjuryRequest request) {
        requireValidSeverity(request.severity());
        requireValidStatus(request.status());
        Injury injury = new Injury();
        injury.setUserId(userId);
        injury.setBodyPart(request.bodyPart());
        injury.setDescription(request.description());
        injury.setInjuryDate(request.injuryDate());
        injury.setSeverity(request.severity());
        injury.setStatus(request.status());
        injury.setNotes(request.notes());
        return toResponse(injuryRepository.save(injury));
    }

    @Transactional
    public InjuryResponse update(UUID userId, UUID id, UpdateInjuryRequest request) {
        Injury injury = findOwned(userId, id);
        if (request.bodyPart() != null) injury.setBodyPart(request.bodyPart());
        if (request.description() != null) injury.setDescription(request.description());
        if (request.injuryDate() != null) injury.setInjuryDate(request.injuryDate());
        if (request.severity() != null) {
            requireValidSeverity(request.severity());
            injury.setSeverity(request.severity());
        }
        if (request.status() != null) {
            requireValidStatus(request.status());
            injury.setStatus(request.status());
        }
        if (request.notes() != null) injury.setNotes(request.notes());
        return toResponse(injuryRepository.save(injury));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        injuryRepository.deleteByIdAndUserId(id, userId);
    }

    private Injury findOwned(UUID userId, UUID id) {
        return injuryRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Injury not found"));
    }

    private void requireValidSeverity(String severity) {
        if (!VALID_SEVERITIES.contains(severity)) {
            throw ApiException.badRequest("Invalid severity: " + severity);
        }
    }

    private void requireValidStatus(String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw ApiException.badRequest("Invalid status: " + status);
        }
    }

    private InjuryResponse toResponse(Injury injury) {
        return new InjuryResponse(
                injury.getId(),
                injury.getBodyPart(),
                injury.getDescription(),
                injury.getInjuryDate(),
                injury.getSeverity(),
                injury.getStatus(),
                injury.getNotes());
    }
}
