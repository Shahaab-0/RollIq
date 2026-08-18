package com.rolliq.api.service;

import com.rolliq.api.dto.gym.CreateGymRequest;
import com.rolliq.api.dto.gym.GymResponse;
import com.rolliq.api.dto.gym.JoinGymRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.Gym;
import com.rolliq.api.model.GymMembership;
import com.rolliq.api.repository.GymClassEntryRepository;
import com.rolliq.api.repository.GymMembershipRepository;
import com.rolliq.api.repository.GymRepository;
import com.rolliq.api.repository.GymSummary;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GymService {

    // Excludes 0/O/1/I to avoid ambiguous codes when a trainer reads one
    // aloud or types it on a phone.
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 8;
    private static final int MAX_CODE_ATTEMPTS = 3;

    private final GymRepository gymRepository;
    private final GymMembershipRepository membershipRepository;
    private final GymClassEntryRepository classEntryRepository;
    private final GymAccessService gymAccessService;
    private final SecureRandom random = new SecureRandom();

    public List<GymResponse> list(UUID userId) {
        return gymRepository.findAllForUser(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public GymResponse create(UUID userId, CreateGymRequest request) {
        Gym gym = new Gym();
        gym.setName(request.name());
        gym.setDescription(request.description());
        gym.setCreatedBy(userId);
        gym.setInviteCode(generateUniqueInviteCode());
        gym = gymRepository.save(gym);

        GymMembership ownerMembership = new GymMembership();
        ownerMembership.setGymId(gym.getId());
        ownerMembership.setUserId(userId);
        ownerMembership.setRole("owner");
        membershipRepository.save(ownerMembership);

        return new GymResponse(
                gym.getId(),
                gym.getName(),
                gym.getDescription(),
                gym.getInviteCode(),
                gym.getCreatedAt(),
                "owner",
                1,
                0);
    }

    public GymResponse get(UUID gymId, UUID userId) {
        GymMembership membership = gymAccessService.requireMembership(gymId, userId);
        Gym gym =
                gymRepository
                        .findById(gymId)
                        .orElseThrow(() -> ApiException.notFound("Gym not found"));
        return new GymResponse(
                gym.getId(),
                gym.getName(),
                gym.getDescription(),
                gym.getInviteCode(),
                gym.getCreatedAt(),
                membership.getRole(),
                membershipRepository.countByGymId(gymId),
                classEntryRepository.countByGymId(gymId));
    }

    @Transactional
    public GymResponse join(UUID userId, JoinGymRequest request) {
        Gym gym =
                gymRepository
                        .findByInviteCode(request.inviteCode().trim().toUpperCase())
                        .orElseThrow(() -> ApiException.notFound("Invalid invite code"));
        if (membershipRepository.existsByGymIdAndUserId(gym.getId(), userId)) {
            throw ApiException.conflict("You're already a member of this gym");
        }
        GymMembership membership = new GymMembership();
        membership.setGymId(gym.getId());
        membership.setUserId(userId);
        membership.setRole("member");
        membershipRepository.save(membership);

        return new GymResponse(
                gym.getId(),
                gym.getName(),
                gym.getDescription(),
                gym.getInviteCode(),
                gym.getCreatedAt(),
                "member",
                membershipRepository.countByGymId(gym.getId()),
                classEntryRepository.countByGymId(gym.getId()));
    }

    private String generateUniqueInviteCode() {
        for (int attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
            String code = generateCode();
            if (!gymRepository.existsByInviteCode(code)) {
                return code;
            }
        }
        throw ApiException.conflict("Could not generate a unique invite code, try again");
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    private GymResponse toResponse(GymSummary summary) {
        return new GymResponse(
                summary.getId(),
                summary.getName(),
                summary.getDescription(),
                summary.getInviteCode(),
                summary.getCreatedAt(),
                summary.getMyRole(),
                summary.getMemberCount(),
                summary.getClassCount());
    }
}
