package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RollControllerIT extends AbstractIntegrationTest {

    @Test
    void createUpdateAndDeleteRoll() throws Exception {
        String token = signUpAndGetAccessToken("roll1@example.com");

        String created = mockMvc
                .perform(post("/api/v1/rolls")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "partner_name", "Alex",
                                "submissions_landed", List.of("armbar"),
                                "effort_rating", 4))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.submissions_landed[0]").value("armbar"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String id = objectMapper.readTree(created).get("id").asText();

        mockMvc.perform(patch("/api/v1/rolls/" + id)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("escapes", 2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.escapes").value(2));

        mockMvc.perform(delete("/api/v1/rolls/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
    }

    @Test
    void partnerHistoryAggregatesAcrossRollsWithTheSamePartnerCaseInsensitively() throws Exception {
        String token = signUpAndGetAccessToken("roll-partner@example.com");

        mockMvc.perform(post("/api/v1/rolls")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "partner_name", "Alex",
                        "submissions_landed", List.of("armbar", "triangle")))));
        mockMvc.perform(post("/api/v1/rolls")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "partner_name", "alex ",
                        "submissions_received", List.of("kimura")))));
        mockMvc.perform(post("/api/v1/rolls")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("partner_name", "Jordan"))));

        mockMvc.perform(get("/api/v1/rolls/partners").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.partner_name =~ /(?i)alex.*/)].roll_count").value(2))
                .andExpect(jsonPath("$[?(@.partner_name =~ /(?i)alex.*/)].landed_total").value(2))
                .andExpect(jsonPath("$[?(@.partner_name =~ /(?i)alex.*/)].received_total").value(1));
    }
}
