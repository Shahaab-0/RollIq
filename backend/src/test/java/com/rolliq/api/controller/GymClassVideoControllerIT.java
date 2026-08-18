package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GymClassVideoControllerIT extends AbstractIntegrationTest {

    @Test
    void ownerCanAddAVideoWithTechniquesAndAPlainMemberCannot() throws Exception {
        String ownerToken = signUpAndGetAccessToken("video-owner@example.com");
        String memberToken = signUpAndGetAccessToken("video-member@example.com");

        String[] gym = createGym(ownerToken, "Video Test Gym");
        String gymId = gym[0];
        joinGym(memberToken, gym[1]);
        String classId = createClass(ownerToken, gymId, "Leg Lock Night");

        mockMvc.perform(post("/api/v1/gyms/" + gymId + "/classes/" + classId + "/videos")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "url", "https://example.com/v1",
                                "techniques", List.of("Ashi Garami", "Straight Ankle Lock"),
                                "sequence_number", 1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.techniques.length()").value(2))
                .andExpect(jsonPath("$.techniques[0]").value("Ashi Garami"));

        mockMvc.perform(post("/api/v1/gyms/" + gymId + "/classes/" + classId + "/videos")
                        .header("Authorization", bearer(memberToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("techniques", List.of("Should Fail"), "sequence_number", 2))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/gyms/" + gymId + "/classes/" + classId + "/videos")
                        .header("Authorization", bearer(memberToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    private String[] createGym(String token, String name) throws Exception {
        String response = mockMvc
                .perform(post("/api/v1/gyms")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", name))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        var json = objectMapper.readTree(response);
        return new String[] {json.get("id").asText(), json.get("invite_code").asText()};
    }

    private void joinGym(String token, String inviteCode) throws Exception {
        mockMvc.perform(post("/api/v1/gyms/join")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("invite_code", inviteCode))));
    }

    private String createClass(String token, String gymId, String title) throws Exception {
        String response = mockMvc
                .perform(post("/api/v1/gyms/" + gymId + "/classes")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("title", title, "class_date", "2026-08-10"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
