package com.rolliq.api.service;

import com.rolliq.api.dto.gym.GymMemberResponse;
import com.rolliq.api.dto.gym.UpdateMemberRoleRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.GymMembership;
import com.rolliq.api.repository.GymMemberSummary;
import com.rolliq.api.repository.GymMembershipRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GymMembershipService {

    private static final Set<String> ASSIGNABLE_ROLES = Set.of("member", "trainer");

    private final GymMembershipRepository membershipRepository;
    private final GymAccessService gymAccessService;

    public List<GymMemberResponse> list(UUID gymId, UUID userId) {
        gymAccessService.requireMembership(gymId, userId);
        return membershipRepository.findByGymIdWithProfile(gymId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GymMemberResponse updateRole(
            UUID gymId, UUID targetUserId, UUID actingUserId, UpdateMemberRoleRequest request) {
        gymAccessService.requireOwner(gymId, actingUserId);
        if (!ASSIGNABLE_ROLES.contains(request.role())) {
            throw ApiException.badRequest("role must be 'member' or 'trainer'");
        }
        GymMembership membership =
                membershipRepository
                        .findByGymIdAndUserId(gymId, targetUserId)
                        .orElseThrow(() -> ApiException.notFound("Membership not found"));
        if ("owner".equals(membership.getRole())) {
            throw ApiException.badRequest("Cannot change the owner's role");
        }
        membership.setRole(request.role());
        membershipRepository.save(membership);

        return membershipRepository
                .findByGymIdAndUserIdWithProfile(gymId, targetUserId)
                .map(this::toResponse)
                .orElseThrow(() -> ApiException.notFound("Membership not found"));
    }

    private GymMemberResponse toResponse(GymMemberSummary summary) {
        return new GymMemberResponse(
                summary.getUserId(), summary.getDisplayName(), summary.getRole(), summary.getJoinedAt());
    }
}
