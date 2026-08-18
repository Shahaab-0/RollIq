package com.rolliq.api.dto.auth;

import java.time.Instant;
import java.util.UUID;

public record AuthResponse(
        UserSummary user, String accessToken, String refreshToken, Instant expiresAt) {

    public record UserSummary(UUID id, String email) {}
}
