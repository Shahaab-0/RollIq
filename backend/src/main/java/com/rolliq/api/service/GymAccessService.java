package com.rolliq.api.service;

import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.GymMembership;
import com.rolliq.api.repository.GymMembershipRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

// The app's first per-resource authorization check beyond row ownership.
// Every gym-scoped service calls through here instead of duplicating the
// membership/role lookup.
@Service
@RequiredArgsConstructor
public class GymAccessService {

    private final GymMembershipRepository membershipRepository;

    // 404, not 403 -- same existence-hiding convention as ownership checks
    // elsewhere in this app: a non-member shouldn't learn whether a gym id
    // exists at all.
    public GymMembership requireMembership(UUID gymId, UUID userId) {
        return membershipRepository
                .findByGymIdAndUserId(gymId, userId)
                .orElseThrow(() -> ApiException.notFound("Gym not found"));
    }

    // 403 here, not 404 -- by this point the caller has already proven
    // membership (existence is no longer secret), they just can't do this.
    public GymMembership requireTrainerOrOwner(UUID gymId, UUID userId) {
        GymMembership membership = requireMembership(gymId, userId);
        if (!"owner".equals(membership.getRole()) && !"trainer".equals(membership.getRole())) {
            throw ApiException.forbidden("Only the gym's owner or trainers can do this");
        }
        return membership;
    }

    public GymMembership requireOwner(UUID gymId, UUID userId) {
        GymMembership membership = requireMembership(gymId, userId);
        if (!"owner".equals(membership.getRole())) {
            throw ApiException.forbidden("Only the gym's owner can do this");
        }
        return membership;
    }
}
