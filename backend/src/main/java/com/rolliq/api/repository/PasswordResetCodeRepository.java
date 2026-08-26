package com.rolliq.api.repository;

import com.rolliq.api.model.PasswordResetCode;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, UUID> {

    // Looked up by user, not by the guessed code's hash -- resetPassword
    // needs the outstanding code row even when the submitted guess is
    // wrong, so it can increment that row's attempt counter.
    Optional<PasswordResetCode> findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(UUID userId);

    // REQUIRES_NEW and its own @Modifying commit: resetPassword() rejects a
    // wrong guess by throwing, and Spring's default rollback-on-
    // RuntimeException would otherwise undo this increment along with
    // everything else in that same transaction -- this needs to survive
    // that rollback independently, or attempt-counting never actually locks
    // anyone out.
    @Modifying
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Query("update PasswordResetCode p set p.attempts = p.attempts + 1 where p.id = :id")
    void incrementAttempts(@Param("id") UUID id);
}
