package com.rolliq.api.controller;

import com.rolliq.api.dto.auth.AuthResponse;
import com.rolliq.api.dto.auth.ForgotPasswordRequest;
import com.rolliq.api.dto.auth.RefreshRequest;
import com.rolliq.api.dto.auth.ResetPasswordRequest;
import com.rolliq.api.dto.auth.SignInRequest;
import com.rolliq.api.dto.auth.SignUpRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUser currentUser;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        AuthResponse response = authService.signUp(request.email(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/signin")
    public AuthResponse signIn(@Valid @RequestBody SignInRequest request) {
        return authService.signIn(request.email(), request.password());
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/signout")
    public ResponseEntity<Void> signOut(@Valid @RequestBody RefreshRequest request) {
        authService.signOut(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public AuthResponse.UserSummary me() {
        return authService.me(currentUser.id());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.email(), request.code(), request.newPassword());
        return ResponseEntity.ok().build();
    }
}
