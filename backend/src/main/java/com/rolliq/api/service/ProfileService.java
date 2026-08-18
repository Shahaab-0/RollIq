package com.rolliq.api.service;

import com.rolliq.api.dto.profile.ProfileResponse;
import com.rolliq.api.dto.profile.UpdateProfileRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.Profile;
import com.rolliq.api.repository.ProfileRepository;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final Set<String> VALID_BELTS =
            Set.of("white", "blue", "purple", "brown", "black");

    private final ProfileRepository profileRepository;

    @Transactional
    public ProfileResponse getOrCreate(UUID userId) {
        Profile profile = profileRepository.findById(userId).orElseGet(() -> {
            Profile created = new Profile();
            created.setId(userId);
            return profileRepository.save(created);
        });
        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse update(UUID userId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findById(userId).orElseThrow(
                () -> ApiException.notFound("No profile found for this user"));

        if (request.displayName() != null) profile.setDisplayName(request.displayName());
        if (request.homeGym() != null) profile.setHomeGym(request.homeGym());
        if (request.currentBelt() != null) {
            if (!VALID_BELTS.contains(request.currentBelt())) {
                throw ApiException.badRequest("Invalid belt: " + request.currentBelt());
            }
            profile.setCurrentBelt(request.currentBelt());
        }
        if (request.currentStripes() != null) {
            if (request.currentStripes() < 0 || request.currentStripes() > 4) {
                throw ApiException.badRequest("currentStripes must be between 0 and 4");
            }
            profile.setCurrentStripes(request.currentStripes());
        }

        return toResponse(profileRepository.save(profile));
    }

    private ProfileResponse toResponse(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getDisplayName(),
                profile.getCurrentBelt(),
                profile.getCurrentStripes(),
                profile.getHomeGym());
    }
}
