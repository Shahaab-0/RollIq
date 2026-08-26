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

class CompetitionMatchControllerIT extends AbstractIntegrationTest {

    private String createCompetition(String token) throws Exception {
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
        return objectMapper.readTree(created).get("id").asText();
    }

    @Test
    void createUpdateAndDeleteMatch() throws Exception {
        String token = signUpAndGetAccessToken("match1@example.com");
        String competitionId = createCompetition(token);

        String created = mockMvc
                .perform(post("/api/v1/competitions/" + competitionId + "/matches")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "opponent_name", "Joao Silva",
                                "result", "win",
                                "method", "Submission - Armbar",
                                "match_order", 1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.opponent_name").value("Joao Silva"))
                .andExpect(jsonPath("$.result").value("win"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String matchId = objectMapper.readTree(created).get("id").asText();

        mockMvc.perform(get("/api/v1/competitions/" + competitionId + "/matches")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(patch("/api/v1/competitions/" + competitionId + "/matches/" + matchId)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("result", "loss"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("loss"));

        mockMvc.perform(delete("/api/v1/competitions/" + competitionId + "/matches/" + matchId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
    }

    @Test
    void invalidResultIsRejectedWithACleanBadRequest() throws Exception {
        String token = signUpAndGetAccessToken("match2@example.com");
        String competitionId = createCompetition(token);

        mockMvc.perform(post("/api/v1/competitions/" + competitionId + "/matches")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "opponent_name", "Someone",
                                "result", "tie-breaker",
                                "match_order", 1))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void aUserCannotAddMatchesToAnotherUsersCompetition() throws Exception {
        String tokenA = signUpAndGetAccessToken("match-a@example.com");
        String tokenB = signUpAndGetAccessToken("match-b@example.com");
        String competitionId = createCompetition(tokenA);

        mockMvc.perform(post("/api/v1/competitions/" + competitionId + "/matches")
                        .header("Authorization", bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "opponent_name", "Someone",
                                "result", "win",
                                "match_order", 1))))
                .andExpect(status().isNotFound());
    }
}
