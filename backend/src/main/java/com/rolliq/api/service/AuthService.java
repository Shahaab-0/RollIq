package com.rolliq.api.service;

import com.rolliq.api.dto.auth.AuthResponse;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.PasswordResetCode;
import com.rolliq.api.model.Profile;
import com.rolliq.api.model.RefreshToken;
import com.rolliq.api.model.User;
import com.rolliq.api.repository.PasswordResetCodeRepository;
import com.rolliq.api.repository.ProfileRepository;
import com.rolliq.api.repository.RefreshTokenRepository;
import com.rolliq.api.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final long RESET_CODE_TTL_MINUTES = 15;

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${jwt.refresh-token-ttl-days}")
    private long refreshTokenTtlDays;

    @Transactional
    public AuthResponse signUp(String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user = userRepository.save(user);

        Profile profile = new Profile();
        profile.setId(user.getId());
        profileRepository.save(profile);

        return issueTokens(user);
    }

    public AuthResponse signIn(String email, String rawPassword) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository
                .findByTokenHash(hash(rawRefreshToken))
                .orElseThrow(() -> ApiException.unauthorized("Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.unauthorized("Refresh token expired or revoked");
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = userRepository
                .findById(stored.getUserId())
                .orElseThrow(() -> ApiException.unauthorized("Invalid refresh token"));
        return issueTokens(user);
    }

    @Transactional
    public void signOut(String rawRefreshToken) {
        refreshTokenRepository.findByTokenHash(hash(rawRefreshToken)).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    public AuthResponse.UserSummary me(UUID userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Not authenticated"));
        return new AuthResponse.UserSummary(user.getId(), user.getEmail());
    }

    // Always succeeds from the caller's point of view whether or not the
    // email exists -- returning a different response for an unknown email
    // would let anyone enumerate registered accounts.
    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String code = generateResetCode();

            PasswordResetCode resetCode = new PasswordResetCode();
            resetCode.setUserId(user.getId());
            resetCode.setCodeHash(hash(code));
            resetCode.setExpiresAt(Instant.now().plus(RESET_CODE_TTL_MINUTES, ChronoUnit.MINUTES));
            passwordResetCodeRepository.save(resetCode);

            emailService.sendPasswordResetCode(email, code);
        });
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired code"));

        PasswordResetCode resetCode = passwordResetCodeRepository
                .findFirstByUserIdAndCodeHashAndUsedAtIsNullOrderByCreatedAtDesc(
                        user.getId(), hash(code))
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired code"));

        if (resetCode.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Invalid or expired code");
        }

        resetCode.setUsedAt(Instant.now());
        passwordResetCodeRepository.save(resetCode);

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Force re-login everywhere -- a password reset is exactly the
        // moment a session might have been compromised.
        refreshTokenRepository.revokeAllForUser(user.getId());
    }

    @Transactional
    public void deleteAccount(UUID userId) {
        // Every owned table references users with "on delete cascade" (see
        // V1__init.sql and every migration since) -- deleting the user row
        // is enough to remove everything they own.
        userRepository.deleteById(userId);
    }

    private static String generateResetCode() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String rawRefreshToken = generateRawToken();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(user.getId());
        refreshToken.setTokenHash(hash(rawRefreshToken));
        refreshToken.setExpiresAt(Instant.now().plus(refreshTokenTtlDays, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                new AuthResponse.UserSummary(user.getId(), user.getEmail()),
                accessToken,
                rawRefreshToken,
                jwtService.accessTokenExpiry());
    }

    private static String generateRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
