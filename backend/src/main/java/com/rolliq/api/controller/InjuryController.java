package com.rolliq.api.controller;

import com.rolliq.api.dto.injury.CreateInjuryRequest;
import com.rolliq.api.dto.injury.InjuryResponse;
import com.rolliq.api.dto.injury.UpdateInjuryRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.InjuryService;
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
@RequestMapping("/api/v1/injuries")
@RequiredArgsConstructor
public class InjuryController {

    private final InjuryService injuryService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<InjuryResponse> list() {
        return injuryService.list(currentUser.id());
    }

    @PostMapping
    public ResponseEntity<InjuryResponse> create(@Valid @RequestBody CreateInjuryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(injuryService.create(currentUser.id(), request));
    }

    @PatchMapping("/{id}")
    public InjuryResponse update(@PathVariable UUID id, @RequestBody UpdateInjuryRequest request) {
        return injuryService.update(currentUser.id(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        injuryService.delete(currentUser.id(), id);
        return ResponseEntity.noContent().build();
    }
}
