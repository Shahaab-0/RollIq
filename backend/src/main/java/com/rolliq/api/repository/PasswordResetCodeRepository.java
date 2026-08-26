package com.rolliq.api.repository;

import com.rolliq.api.model.PasswordResetCode;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, UUID> {

    Optional<PasswordResetCode> findFirstByUserIdAndCodeHashAndUsedAtIsNullOrderByCreatedAtDesc(
            UUID userId, String codeHash);
}
