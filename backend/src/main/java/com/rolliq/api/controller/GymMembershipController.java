package com.rolliq.api.controller;

import com.rolliq.api.dto.gym.GymMemberResponse;
import com.rolliq.api.dto.gym.UpdateMemberRoleRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.GymMembershipService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gyms/{gymId}/members")
@RequiredArgsConstructor
public class GymMembershipController {

    private final GymMembershipService membershipService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<GymMemberResponse> list(@PathVariable UUID gymId) {
        return membershipService.list(gymId, currentUser.id());
    }

    @PatchMapping("/{userId}")
    public GymMemberResponse updateRole(
            @PathVariable UUID gymId,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        return membershipService.updateRole(gymId, userId, currentUser.id(), request);
    }
}
