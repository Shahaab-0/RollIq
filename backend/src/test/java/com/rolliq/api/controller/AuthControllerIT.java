package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerIT extends AbstractIntegrationTest {

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
}
