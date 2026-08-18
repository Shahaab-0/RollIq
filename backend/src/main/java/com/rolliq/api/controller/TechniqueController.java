package com.rolliq.api.controller;

import com.rolliq.api.dto.technique.CreateTechniqueRequest;
import com.rolliq.api.dto.technique.ImportTechniqueSeed;
import com.rolliq.api.dto.technique.TechniqueResponse;
import com.rolliq.api.dto.technique.UpdateTechniqueRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.TechniqueService;
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
@RequestMapping("/api/v1/techniques")
@RequiredArgsConstructor
public class TechniqueController {

    private final TechniqueService techniqueService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<TechniqueResponse> list() {
        return techniqueService.list(currentUser.id());
    }

    @PostMapping
    public ResponseEntity<TechniqueResponse> create(@Valid @RequestBody CreateTechniqueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(techniqueService.create(currentUser.id(), request));
    }

    @PatchMapping("/{id}")
    public TechniqueResponse update(
            @PathVariable UUID id, @RequestBody UpdateTechniqueRequest request) {
        return techniqueService.update(currentUser.id(), id, request);
    }

    @PostMapping("/{id}/drill")
    public TechniqueResponse incrementDrill(@PathVariable UUID id) {
        return techniqueService.incrementDrillCount(currentUser.id(), id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        techniqueService.delete(currentUser.id(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public List<TechniqueResponse> importFundamentals(
            @Valid @RequestBody List<ImportTechniqueSeed> seeds) {
        return techniqueService.importFundamentals(currentUser.id(), seeds);
    }
}
