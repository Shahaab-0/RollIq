package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class InstructionalVideoControllerIT extends AbstractIntegrationTest {

    @Test
    void createAndListVideosForASeries() throws Exception {
        String token = signUpAndGetAccessToken("video1@example.com");
        String instructionalId = createInstructional(token, "Video Test Series");

        mockMvc.perform(post("/api/v1/instructionals/" + instructionalId + "/videos")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("title", "Volume 1", "sequence_number", 1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Volume 1"))
                .andExpect(jsonPath("$.sequence_number").value(1));

        mockMvc.perform(get("/api/v1/instructionals/" + instructionalId + "/videos")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Volume 1"));
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
}
