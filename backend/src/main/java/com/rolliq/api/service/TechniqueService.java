package com.rolliq.api.service;

import com.rolliq.api.dto.technique.CreateTechniqueRequest;
import com.rolliq.api.dto.technique.ImportTechniqueSeed;
import com.rolliq.api.dto.technique.TechniqueResponse;
import com.rolliq.api.dto.technique.UpdateTechniqueRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.Technique;
import com.rolliq.api.repository.TechniqueRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TechniqueService {

    private final TechniqueRepository techniqueRepository;

    public List<TechniqueResponse> list(UUID userId) {
        return techniqueRepository.findByUserIdOrderByNameAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TechniqueResponse create(UUID userId, CreateTechniqueRequest request) {
        Technique technique = new Technique();
        technique.setUserId(userId);
        technique.setName(request.name());
        technique.setPosition(request.position());
        technique.setNotes(request.notes());
        technique.setResourceUrl(request.resourceUrl());
        return toResponse(techniqueRepository.save(technique));
    }

    @Transactional
    public TechniqueResponse update(UUID userId, UUID id, UpdateTechniqueRequest request) {
        Technique technique = findOwned(userId, id);
        if (request.name() != null) technique.setName(request.name());
        if (request.position() != null) technique.setPosition(request.position());
        if (request.notes() != null) technique.setNotes(request.notes());
        if (request.resourceUrl() != null) technique.setResourceUrl(request.resourceUrl());
        return toResponse(techniqueRepository.save(technique));
    }

    @Transactional
    public TechniqueResponse incrementDrillCount(UUID userId, UUID id) {
        Technique technique = findOwned(userId, id);
        technique.setDrillCount(technique.getDrillCount() + 1);
        return toResponse(techniqueRepository.save(technique));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        techniqueRepository.deleteByIdAndUserId(id, userId);
    }

    @Transactional
    public List<TechniqueResponse> importFundamentals(UUID userId, List<ImportTechniqueSeed> seeds) {
        List<Technique> techniques = seeds.stream()
                .map(seed -> {
                    Technique technique = new Technique();
                    technique.setUserId(userId);
                    technique.setName(seed.name());
                    technique.setPosition(seed.position());
                    technique.setNotes(seed.notes());
                    technique.setResourceUrl(seed.resourceUrl());
                    return technique;
                })
                .toList();
        return techniqueRepository.saveAll(techniques).stream().map(this::toResponse).toList();
    }

    private Technique findOwned(UUID userId, UUID id) {
        return techniqueRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Technique not found"));
    }

    private TechniqueResponse toResponse(Technique technique) {
        return new TechniqueResponse(
                technique.getId(),
                technique.getName(),
                technique.getPosition(),
                technique.getNotes(),
                technique.getResourceUrl(),
                technique.getDrillCount());
    }
}
