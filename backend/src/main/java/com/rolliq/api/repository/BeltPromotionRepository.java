package com.rolliq.api.repository;

import com.rolliq.api.model.BeltPromotion;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BeltPromotionRepository extends JpaRepository<BeltPromotion, UUID> {

    List<BeltPromotion> findByUserIdOrderByPromotedOnAsc(UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);
}
