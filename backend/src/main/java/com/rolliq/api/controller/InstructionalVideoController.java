package com.rolliq.api.controller;

import com.rolliq.api.dto.instructional.CreateVideoRequest;
import com.rolliq.api.dto.instructional.InstructionalVideoResponse;
import com.rolliq.api.service.InstructionalVideoService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/instructionals/{instructionalId}/videos")
@RequiredArgsConstructor
public class InstructionalVideoController {

    private final InstructionalVideoService videoService;

    @GetMapping
    public List<InstructionalVideoResponse> list(@PathVariable UUID instructionalId) {
        return videoService.listForInstructional(instructionalId);
    }

    @PostMapping
    public ResponseEntity<InstructionalVideoResponse> create(
            @PathVariable UUID instructionalId, @Valid @RequestBody CreateVideoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(videoService.create(instructionalId, request));
    }
}
