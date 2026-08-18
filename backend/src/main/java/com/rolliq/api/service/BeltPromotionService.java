package com.rolliq.api.service;

import com.rolliq.api.dto.beltpromotion.BeltPromotionResponse;
import com.rolliq.api.dto.beltpromotion.CreateBeltPromotionRequest;
import com.rolliq.api.dto.beltpromotion.LogMilestoneRequest;
import com.rolliq.api.model.BeltPromotion;
import com.rolliq.api.model.Profile;
import com.rolliq.api.repository.BeltPromotionRepository;
import com.rolliq.api.repository.ProfileRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BeltPromotionService {

    private final BeltPromotionRepository beltPromotionRepository;
    private final ProfileRepository profileRepository;

    public List<BeltPromotionResponse> list(UUID userId) {
        return beltPromotionRepository.findByUserIdOrderByPromotedOnAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    // Logs the promotion AND keeps profiles.current_belt/current_stripes in
    // sync in one transaction -- the two writes the RN client used to do as
    // separate dispatches now happen together, server-side.
    @Transactional
    public BeltPromotionResponse createPromotion(UUID userId, CreateBeltPromotionRequest request) {
        BeltPromotion promotion = new BeltPromotion();
        promotion.setUserId(userId);
        promotion.setBelt(request.belt());
        promotion.setPromotedOn(request.promotedOn());
        promotion.setNotes(request.notes());
        promotion.setStripes(0);
        promotion = beltPromotionRepository.save(promotion);

        Profile profile = profileRepository.findById(userId).orElseGet(() -> {
            Profile created = new Profile();
            created.setId(userId);
            return created;
        });
        profile.setCurrentBelt(request.belt());
        profile.setCurrentStripes(0);
        profileRepository.save(profile);

        return toResponse(promotion);
    }

    @Transactional
    public BeltPromotionResponse logMilestone(UUID userId, LogMilestoneRequest request) {
        BeltPromotion promotion = new BeltPromotion();
        promotion.setUserId(userId);
        promotion.setBelt(request.belt());
        promotion.setStripes(request.stripes());
        promotion.setPromotedOn(request.promotedOn() != null ? request.promotedOn() : LocalDate.now());
        return toResponse(beltPromotionRepository.save(promotion));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        beltPromotionRepository.deleteByIdAndUserId(id, userId);
    }

    private BeltPromotionResponse toResponse(BeltPromotion promotion) {
        return new BeltPromotionResponse(
                promotion.getId(),
                promotion.getBelt(),
                promotion.getStripes(),
                promotion.getPromotedOn(),
                promotion.getNotes());
    }
}
