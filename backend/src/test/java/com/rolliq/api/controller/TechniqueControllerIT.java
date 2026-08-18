package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TechniqueControllerIT extends AbstractIntegrationTest {

    @Test
    void createListDrillAndDeleteTechnique() throws Exception {
        String token = signUpAndGetAccessToken("tech1@example.com");

        String created = mockMvc
                .perform(post("/api/v1/techniques")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("name", "Scissor Sweep", "position", "guard"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.drill_count").value(0))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String id = objectMapper.readTree(created).get("id").asText();

        mockMvc.perform(post("/api/v1/techniques/" + id + "/drill").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.drill_count").value(1));

        mockMvc.perform(get("/api/v1/techniques").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(delete("/api/v1/techniques/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/techniques").header("Authorization", bearer(token)))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void anotherUserCannotReadOrEditSomeoneElsesTechnique() throws Exception {
        String ownerToken = signUpAndGetAccessToken("tech-owner@example.com");
        String intruderToken = signUpAndGetAccessToken("tech-intruder@example.com");

        String created = mockMvc
                .perform(post("/api/v1/techniques")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("name", "Armbar", "position", "mount"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String id = objectMapper.readTree(created).get("id").asText();

        mockMvc.perform(patch("/api/v1/techniques/" + id)
                        .header("Authorization", bearer(intruderToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "Hijacked"))))
                .andExpect(status().isNotFound());

        JsonNode intrudersList = objectMapper.readTree(mockMvc
                .perform(get("/api/v1/techniques").header("Authorization", bearer(intruderToken)))
                .andReturn()
                .getResponse()
                .getContentAsString());
        org.junit.jupiter.api.Assertions.assertEquals(0, intrudersList.size());
    }
}
