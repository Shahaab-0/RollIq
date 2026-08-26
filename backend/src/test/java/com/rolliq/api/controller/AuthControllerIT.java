package com.rolliq.api.controller;

import com.rolliq.api.service.EmailService;
import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerIT extends AbstractIntegrationTest {

    @Autowired
    private EmailService emailService;

    @Test
    void signUpThenMeReturnsTheAccount() throws Exception {
        String token = signUpAndGetAccessToken("rolls@example.com");

        mockMvc.perform(get("/api/v1/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("rolls@example.com"));
    }

    @Test
    void signUpWithDuplicateEmailIsRejected() throws Exception {
        signUpAndGetAccessToken("dupe@example.com");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "dupe@example.com", "password", "another-password"))))
                .andExpect(status().isConflict());
    }

    @Test
    void signInWithWrongPasswordIsUnauthorized() throws Exception {
        signUpAndGetAccessToken("badpass@example.com");

        mockMvc.perform(post("/api/v1/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "badpass@example.com", "password", "totally-wrong"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meWithoutTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void refreshRotatesTokenAndInvalidatesThePrevious() throws Exception {
        String signupResponse = mockMvc
                .perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "refresh@example.com", "password", "correct-horse-battery-staple"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String refreshToken = objectMapper.readTree(signupResponse).get("refresh_token").asText();

        MvcResult refreshed = mockMvc
                .perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refresh_token", refreshToken))))
                .andExpect(status().isOk())
                .andReturn();
        String newRefreshToken = objectMapper
                .readTree(refreshed.getResponse().getContentAsString())
                .get("refresh_token")
                .asText();

        // the old refresh token was single-use -- it must no longer work
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refresh_token", refreshToken))))
                .andExpect(status().isUnauthorized());

        // the newly issued one must
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refresh_token", newRefreshToken))))
                .andExpect(status().isOk());
    }

    @Test
    void signOutRevokesTheRefreshToken() throws Exception {
        String signupResponse = mockMvc
                .perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "signout@example.com", "password", "correct-horse-battery-staple"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String refreshToken = objectMapper.readTree(signupResponse).get("refresh_token").asText();

        mockMvc.perform(post("/api/v1/auth/signout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refresh_token", refreshToken))))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refresh_token", refreshToken))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void forgotPasswordReturnsOkWhetherOrNotTheEmailExists() throws Exception {
        signUpAndGetAccessToken("forgot-real@example.com");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "forgot-real@example.com"))))
                .andExpect(status().isOk());

        // same 200 for an email that was never registered -- the response
        // must not leak which emails exist in the system
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "never-signed-up@example.com"))))
                .andExpect(status().isOk());
    }

    @Test
    void resetPasswordWithTheEmailedCodeChangesThePasswordAndRevokesOldSessions() throws Exception {
        String signupResponse = mockMvc
                .perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "reset-flow@example.com", "password", "original-password"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String oldRefreshToken = objectMapper.readTree(signupResponse).get("refresh_token").asText();

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "reset-flow@example.com"))));

        String code = emailService.lastCodeFor("reset-flow@example.com");
        assertThat(code).isNotNull();

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "reset-flow@example.com",
                                "code", code,
                                "new_password", "brand-new-password"))))
                .andExpect(status().isOk());

        // the old refresh token must be revoked by a password reset
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refresh_token", oldRefreshToken))))
                .andExpect(status().isUnauthorized());

        // old password no longer works, new one does
        mockMvc.perform(post("/api/v1/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "reset-flow@example.com", "password", "original-password"))))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "reset-flow@example.com", "password", "brand-new-password"))))
                .andExpect(status().isOk());
    }

    @Test
    void resetPasswordWithAWrongCodeIsRejected() throws Exception {
        signUpAndGetAccessToken("wrong-code@example.com");
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "wrong-code@example.com"))));

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "wrong-code@example.com",
                                "code", "000000",
                                "new_password", "brand-new-password"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resetPasswordLocksOutAfterTooManyWrongGuesses() throws Exception {
        signUpAndGetAccessToken("locked-out@example.com");
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "locked-out@example.com"))));

        String realCode = emailService.lastCodeFor("locked-out@example.com");
        assertThat(realCode).isNotNull();
        // "000000" is never the real code here since generateResetCode()
        // draws uniformly from 000000-999999 and a same-digit code is a
        // 1-in-a-million coincidence -- stable enough for a test.
        String wrongCode = "000000".equals(realCode) ? "111111" : "000000";

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/auth/reset-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of(
                                    "email", "locked-out@example.com",
                                    "code", wrongCode,
                                    "new_password", "brand-new-password"))))
                    .andExpect(status().isBadRequest());
        }

        // The real code is now rejected too -- the outstanding code was
        // locked out after 5 wrong guesses, not just that one guess.
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "locked-out@example.com",
                                "code", realCode,
                                "new_password", "brand-new-password"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteAccountRequiresAuthenticationAndRemovesTheAccount() throws Exception {
        mockMvc.perform(delete("/api/v1/account")).andExpect(status().isUnauthorized());

        String token = signUpAndGetAccessToken("delete-me@example.com");
        mockMvc.perform(delete("/api/v1/account").header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/v1/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "delete-me@example.com", "password", "correct-horse-battery-staple"))))
                .andExpect(status().isUnauthorized());
    }
}
