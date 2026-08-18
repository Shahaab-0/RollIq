package com.rolliq.api.controller;

import com.rolliq.api.dto.instructional.CreateInstructionalRequest;
import com.rolliq.api.dto.instructional.InstructionalResponse;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.InstructionalService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/instructionals")
@RequiredArgsConstructor
public class InstructionalController {

    private final InstructionalService instructionalService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<InstructionalResponse> list() {
        return instructionalService.list(currentUser.id());
    }

    @PostMapping
    public ResponseEntity<InstructionalResponse> create(
            @Valid @RequestBody CreateInstructionalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(instructionalService.create(currentUser.id(), request));
    }
}
