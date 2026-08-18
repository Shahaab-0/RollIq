package com.rolliq.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class InstructionalProgressControllerIT extends AbstractIntegrationTest {

    @Test
    void progressIsPerUserAndReflectedInTheCatalogSummary() throws Exception {
        String tokenA = signUpAndGetAccessToken("progress-a@example.com");
        String tokenB = signUpAndGetAccessToken("progress-b@example.com");

        String instructionalId = createInstructional(tokenA, "Progress Test Series");
        String videoId = createVideo(tokenA, instructionalId, "Volume 1");

        mockMvc.perform(put("/api/v1/instructional-progress/" + videoId)
                        .header("Authorization", bearer(tokenA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "completed"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("completed"));

        assertEquals(
                1,
                findByTitle(fetchInstructionals(tokenA), "Progress Test Series")
                        .get("completed_video_count")
                        .asLong());

        // shared instructional, but progress is independent per user
        assertEquals(
                0,
                findByTitle(fetchInstructionals(tokenB), "Progress Test Series")
                        .get("completed_video_count")
                        .asLong());

        mockMvc.perform(delete("/api/v1/instructional-progress/" + videoId)
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isNoContent());

        assertEquals(
                0,
                findByTitle(fetchInstructionals(tokenA), "Progress Test Series")
                        .get("completed_video_count")
                        .asLong());
    }

    @Test
    void invalidStatusIsRejected() throws Exception {
        String token = signUpAndGetAccessToken("progress-invalid@example.com");
        String instructionalId = createInstructional(token, "Invalid Status Series");
        String videoId = createVideo(token, instructionalId, "Volume 1");

        mockMvc.perform(put("/api/v1/instructional-progress/" + videoId)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "on_the_moon"))))
                .andExpect(status().isBadRequest());
    }

    private String fetchInstructionals(String token) throws Exception {
        return mockMvc
                .perform(get("/api/v1/instructionals").header("Authorization", bearer(token)))
                .andReturn()
                .getResponse()
                .getContentAsString();
    }

    private JsonNode findByTitle(String json, String title) throws Exception {
        for (JsonNode item : objectMapper.readTree(json)) {
            if (title.equals(item.get("title").asText())) {
                return item;
            }
        }
        throw new AssertionError("not found: " + title);
    }

    private String createInstructional(String token, String title) throws Exception {
        String response = mockMvc
                .perform(post("/api/v1/instructionals")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", title, "instructor", "Test Instructor", "category", "Leg Locks", "difficulty", "intermediate"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }

    private String createVideo(String token, String instructionalId, String title) throws Exception {
        String response = mockMvc
                .perform(post("/api/v1/instructionals/" + instructionalId + "/videos")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("title", title, "sequence_number", 1))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
