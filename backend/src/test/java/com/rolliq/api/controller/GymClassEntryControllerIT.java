package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GymClassEntryControllerIT extends AbstractIntegrationTest {

    @Test
    void ownerCanPostAClassEntryPlainMemberCannotThenTrainerCan() throws Exception {
        String ownerToken = signUpAndGetAccessToken("class-owner@example.com");
        String memberToken = signUpAndGetAccessToken("class-member@example.com");

        String[] gym = createGym(ownerToken, "Class Test Gym");
        String gymId = gym[0];
        joinGym(memberToken, gym[1]);

        mockMvc.perform(post("/api/v1/gyms/" + gymId + "/classes")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "No-Gi Fundamentals", "class_date", "2026-08-10"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("No-Gi Fundamentals"));

        mockMvc.perform(post("/api/v1/gyms/" + gymId + "/classes")
                        .header("Authorization", bearer(memberToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Should Fail", "class_date", "2026-08-11"))))
                .andExpect(status().isForbidden());

        String memberUserId = currentUserId(memberToken);
        mockMvc.perform(patch("/api/v1/gyms/" + gymId + "/members/" + memberUserId)
                .header("Authorization", bearer(ownerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("role", "trainer"))));

        mockMvc.perform(post("/api/v1/gyms/" + gymId + "/classes")
                        .header("Authorization", bearer(memberToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Now Allowed", "class_date", "2026-08-12"))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/gyms/" + gymId + "/classes").header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void nonMemberCannotListClasses() throws Exception {
        String ownerToken = signUpAndGetAccessToken("class-nonmember-owner@example.com");
        String outsiderToken = signUpAndGetAccessToken("class-nonmember-outsider@example.com");

        String[] gym = createGym(ownerToken, "Private Class Gym");

        mockMvc.perform(get("/api/v1/gyms/" + gym[0] + "/classes").header("Authorization", bearer(outsiderToken)))
                .andExpect(status().isNotFound());
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

    private String currentUserId(String token) throws Exception {
        String response = mockMvc
                .perform(get("/api/v1/profile/me").header("Authorization", bearer(token)))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
