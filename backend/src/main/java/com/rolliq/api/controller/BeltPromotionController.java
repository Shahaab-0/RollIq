package com.rolliq.api.controller;

import com.rolliq.api.dto.beltpromotion.BeltPromotionResponse;
import com.rolliq.api.dto.beltpromotion.CreateBeltPromotionRequest;
import com.rolliq.api.dto.beltpromotion.LogMilestoneRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.BeltPromotionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/belt-promotions")
@RequiredArgsConstructor
public class BeltPromotionController {

    private final BeltPromotionService beltPromotionService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<BeltPromotionResponse> list() {
        return beltPromotionService.list(currentUser.id());
    }

    @PostMapping
    public ResponseEntity<BeltPromotionResponse> create(
            @Valid @RequestBody CreateBeltPromotionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(beltPromotionService.createPromotion(currentUser.id(), request));
    }

    @PostMapping("/milestone")
    public ResponseEntity<BeltPromotionResponse> logMilestone(
            @Valid @RequestBody LogMilestoneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(beltPromotionService.logMilestone(currentUser.id(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        beltPromotionService.delete(currentUser.id(), id);
        return ResponseEntity.noContent().build();
    }
}
