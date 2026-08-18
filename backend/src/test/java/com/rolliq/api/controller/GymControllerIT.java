package com.rolliq.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GymControllerIT extends AbstractIntegrationTest {

    @Test
    void creatingAGymMakesTheCreatorItsOwner() throws Exception {
        String token = signUpAndGetAccessToken("gym-owner@example.com");

        String response = mockMvc
                .perform(post("/api/v1/gyms")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("name", "Test Gym", "description", "A test gym"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.my_role").value("owner"))
                .andExpect(jsonPath("$.member_count").value(1))
                .andExpect(jsonPath("$.class_count").value(0))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        assertEquals(8, json.get("invite_code").asText().length());
    }

    @Test
    void joiningByCodeAddsAMemberAndUpdatesCounts() throws Exception {
        String ownerToken = signUpAndGetAccessToken("gym-join-owner@example.com");
        String memberToken = signUpAndGetAccessToken("gym-join-member@example.com");

        String inviteCode = createGym(ownerToken, "Join Test Gym");

        mockMvc.perform(post("/api/v1/gyms/join")
                        .header("Authorization", bearer(memberToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("invite_code", inviteCode))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.my_role").value("member"))
                .andExpect(jsonPath("$.member_count").value(2));

        // joining twice is a conflict, not a silent no-op
        mockMvc.perform(post("/api/v1/gyms/join")
                        .header("Authorization", bearer(memberToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("invite_code", inviteCode))))
                .andExpect(status().isConflict());
    }

    @Test
    void joiningWithABadCodeReturnsNotFound() throws Exception {
        String token = signUpAndGetAccessToken("gym-badcode@example.com");

        mockMvc.perform(post("/api/v1/gyms/join")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("invite_code", "NOTREAL1"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void aNonMemberCannotSeeAGymAtAll() throws Exception {
        String ownerToken = signUpAndGetAccessToken("gym-private-owner@example.com");
        String outsiderToken = signUpAndGetAccessToken("gym-outsider@example.com");

        String gymId = createGymAndGetId(ownerToken, "Private Gym");

        mockMvc.perform(get("/api/v1/gyms/" + gymId).header("Authorization", bearer(outsiderToken)))
                .andExpect(status().isNotFound());
    }

    private String createGym(String token, String name) throws Exception {
        String response = mockMvc
                .perform(post("/api/v1/gyms")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", name))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("invite_code").asText();
    }

    private String createGymAndGetId(String token, String name) throws Exception {
        String response = mockMvc
                .perform(post("/api/v1/gyms")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", name))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
