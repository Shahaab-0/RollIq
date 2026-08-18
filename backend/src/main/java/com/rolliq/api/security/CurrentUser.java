package com.rolliq.api.security;

import com.rolliq.api.exception.ApiException;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

// Resolves the authenticated user's id from the SecurityContext that
// JwtAuthFilter populated. Every service method that reads/writes owned
// data calls this instead of trusting an id supplied by the client.
@Component
public class CurrentUser {

    public UUID id() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UUID userId) {
            return userId;
        }
        throw ApiException.unauthorized("Not authenticated");
    }
}
