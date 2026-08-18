package com.rolliq.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class InstructionalControllerIT extends AbstractIntegrationTest {

    @Test
    void listReturnsTheSeededCatalogWithZeroProgressForAFreshUser() throws Exception {
        String token = signUpAndGetAccessToken("instr1@example.com");

        String response = mockMvc
                .perform(get("/api/v1/instructionals").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode list = objectMapper.readTree(response);

        assertTrue(list.size() > 0, "expected the seeded catalog to be non-empty");
        // A fresh user has no progress against anything yet -- true regardless
        // of what other tests/users have created in the shared catalog.
        for (JsonNode item : list) {
            assertTrue(item.get("completed_video_count").asLong() == 0);
            assertTrue(item.get("in_progress_video_count").asLong() == 0);
        }
    }

    @Test
    void createdInstructionalIsVisibleToOtherUsersSinceTheCatalogIsShared() throws Exception {
        String ownerToken = signUpAndGetAccessToken("instr-owner@example.com");
        String otherToken = signUpAndGetAccessToken("instr-other@example.com");

        mockMvc.perform(post("/api/v1/instructionals")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Ownership Test Series",
                                "instructor", "Test Instructor",
                                "category", "Leg Locks",
                                "difficulty", "intermediate"))))
                .andExpect(status().isCreated());

        String response = mockMvc
                .perform(get("/api/v1/instructionals").header("Authorization", bearer(otherToken)))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode list = objectMapper.readTree(response);

        boolean found = false;
        for (JsonNode item : list) {
            if ("Ownership Test Series".equals(item.get("title").asText())) {
                found = true;
            }
        }
        assertTrue(found, "instructional created by one user should be visible to another");
    }
}
