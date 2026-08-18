package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SessionControllerIT extends AbstractIntegrationTest {

    @Test
    void createSessionAndAttachTechniques() throws Exception {
        String token = signUpAndGetAccessToken("session1@example.com");

        String techniqueId = createTechnique(token, "Kimura");

        String sessionResponse = mockMvc
                .perform(post("/api/v1/sessions")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "date", "2026-08-15",
                                "gi", true,
                                "session_type", "fundamentals"))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String sessionId = objectMapper.readTree(sessionResponse).get("id").asText();

        mockMvc.perform(put("/api/v1/sessions/" + sessionId + "/techniques")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("technique_ids", List.of(techniqueId)))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/sessions/" + sessionId + "/techniques")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0]").value(techniqueId));
    }

    @Test
    void cannotLinkAnotherUsersTechniqueToYourSession() throws Exception {
        String token = signUpAndGetAccessToken("session2@example.com");
        String otherToken = signUpAndGetAccessToken("session2-other@example.com");
        String otherUsersTechniqueId = createTechnique(otherToken, "Not Yours");

        String sessionResponse = mockMvc
                .perform(post("/api/v1/sessions")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "date", "2026-08-15", "gi", false, "session_type", "open_mat"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String sessionId = objectMapper.readTree(sessionResponse).get("id").asText();

        mockMvc.perform(put("/api/v1/sessions/" + sessionId + "/techniques")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("technique_ids", List.of(otherUsersTechniqueId)))))
                .andExpect(status().isBadRequest());
    }

    private String createTechnique(String token, String name) throws Exception {
        String response = mockMvc
                .perform(post("/api/v1/techniques")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", name, "position", "guard"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
