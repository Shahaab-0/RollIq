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

class CompetitionControllerIT extends AbstractIntegrationTest {

    @Test
    void createUpdateAndDeleteCompetition() throws Exception {
        String token = signUpAndGetAccessToken("comp1@example.com");

        String created = mockMvc
                .perform(post("/api/v1/competitions")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "IBJJF Pan Ams 2026",
                                "competition_date", "2026-03-15",
                                "weight_category", "Featherweight",
                                "belt_division", "Blue Belt Adult"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("IBJJF Pan Ams 2026"))
                .andExpect(jsonPath("$.match_count").value(0))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String id = objectMapper.readTree(created).get("id").asText();

        mockMvc.perform(get("/api/v1/competitions").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(patch("/api/v1/competitions/" + id)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("location", "Kissimmee, FL"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location").value("Kissimmee, FL"));

        mockMvc.perform(delete("/api/v1/competitions/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
    }

    @Test
    void listAggregatesWinLossDrawCountsAcrossMatches() throws Exception {
        String token = signUpAndGetAccessToken("comp2@example.com");

        String created = mockMvc
                .perform(post("/api/v1/competitions")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Local Open",
                                "competition_date", "2026-05-01",
                                "weight_category", "Lightweight"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String competitionId = objectMapper.readTree(created).get("id").asText();

        for (String result : new String[] {"win", "win", "loss"}) {
            mockMvc.perform(post("/api/v1/competitions/" + competitionId + "/matches")
                    .header("Authorization", bearer(token))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of(
                            "opponent_name", "Opponent",
                            "result", result,
                            "match_order", 1))));
        }

        mockMvc.perform(get("/api/v1/competitions").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].match_count").value(3))
                .andExpect(jsonPath("$[0].wins").value(2))
                .andExpect(jsonPath("$[0].losses").value(1))
                .andExpect(jsonPath("$[0].draws").value(0));
    }

    @Test
    void aUserCannotSeeAnotherUsersCompetitions() throws Exception {
        String tokenA = signUpAndGetAccessToken("comp-a@example.com");
        String tokenB = signUpAndGetAccessToken("comp-b@example.com");

        mockMvc.perform(post("/api/v1/competitions")
                .header("Authorization", bearer(tokenA))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "name", "Worlds",
                        "competition_date", "2026-06-01",
                        "weight_category", "Middleweight"))));

        mockMvc.perform(get("/api/v1/competitions").header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
