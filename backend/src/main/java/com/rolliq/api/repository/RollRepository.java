package com.rolliq.api.repository;

import com.rolliq.api.model.Roll;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RollRepository extends JpaRepository<Roll, UUID> {

    List<Roll> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Roll> findByIdAndUserId(UUID id, UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);

    // Grouped by a case/whitespace-normalized partner_name so "Alex" and
    // "alex " aggregate together; min(partner_name) picks one representative
    // spelling to display since the group key itself is normalized away.
    @Query(
            value = """
            select
              min(partner_name) as partnerName,
              count(*) as rollCount,
              sum(coalesce(array_length(submissions_landed, 1), 0)) as landedTotal,
              sum(coalesce(array_length(submissions_received, 1), 0)) as receivedTotal
            from rolls
            where user_id = :userId and partner_name is not null and trim(partner_name) <> ''
            group by lower(trim(partner_name))
            order by rollCount desc
            """,
            nativeQuery = true)
    List<PartnerHistorySummary> findPartnerHistory(@Param("userId") UUID userId);
}
