package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class InjuryControllerIT extends AbstractIntegrationTest {

    @Test
    void createUpdateAndDeleteInjury() throws Exception {
        String token = signUpAndGetAccessToken("injury1@example.com");

        String created = mockMvc
                .perform(post("/api/v1/injuries")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "body_part", "Left knee",
                                "description", "Tweaked it doing a knee slide pass",
                                "injury_date", "2026-08-01",
                                "severity", "moderate",
                                "status", "active"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.body_part").value("Left knee"))
                .andExpect(jsonPath("$.severity").value("moderate"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String id = objectMapper.readTree(created).get("id").asText();

        mockMvc.perform(get("/api/v1/injuries").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(patch("/api/v1/injuries/" + id)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "resolved"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("resolved"));

        mockMvc.perform(delete("/api/v1/injuries/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
    }

    @Test
    void invalidSeverityIsRejectedWithACleanBadRequest() throws Exception {
        String token = signUpAndGetAccessToken("injury2@example.com");

        mockMvc.perform(post("/api/v1/injuries")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "body_part", "Shoulder",
                                "description", "Something",
                                "injury_date", "2026-08-01",
                                "severity", "catastrophic",
                                "status", "active"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void aUserCannotSeeAnotherUsersInjuries() throws Exception {
        String tokenA = signUpAndGetAccessToken("injury-a@example.com");
        String tokenB = signUpAndGetAccessToken("injury-b@example.com");

        mockMvc.perform(post("/api/v1/injuries")
                .header("Authorization", bearer(tokenA))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "body_part", "Rib",
                        "description", "Bruised from a takedown",
                        "injury_date", "2026-08-01",
                        "severity", "mild",
                        "status", "recovering"))));

        mockMvc.perform(get("/api/v1/injuries").header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
