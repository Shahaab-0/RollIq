package com.rolliq.api.controller;

import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Deliberately not under /api/v1/auth -- that whole prefix is permitAll in
// SecurityConfig (signup/signin/refresh/forgot-password all need to work
// without a token), but deleting an account obviously must require one.
@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
public class AccountController {

    private final AuthService authService;
    private final CurrentUser currentUser;

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount() {
        authService.deleteAccount(currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
