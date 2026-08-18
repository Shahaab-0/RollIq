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

class GymMembershipControllerIT extends AbstractIntegrationTest {

    @Test
    void ownerCanPromoteAMemberToTrainer() throws Exception {
        String ownerToken = signUpAndGetAccessToken("membership-owner@example.com");
        String memberToken = signUpAndGetAccessToken("membership-member@example.com");

        String[] gym = createGym(ownerToken, "Promote Test Gym");
        String gymId = gym[0];
        joinGym(memberToken, gym[1]);
        String memberUserId = currentUserId(memberToken);

        mockMvc.perform(patch("/api/v1/gyms/" + gymId + "/members/" + memberUserId)
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("role", "trainer"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("trainer"));

        mockMvc.perform(get("/api/v1/gyms/" + gymId + "/members").header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                // no display_name set at signup -- falls back to "Member", never the
                // user's email (a member shouldn't leak their email to other members)
                .andExpect(jsonPath("$[?(@.role == 'trainer')].display_name").value("Member"));
    }

    @Test
    void aNonOwnerCannotPromoteAnyoneEvenThemselves() throws Exception {
        String ownerToken = signUpAndGetAccessToken("membership-nonowner-owner@example.com");
        String memberToken = signUpAndGetAccessToken("membership-nonowner-member@example.com");

        String[] gym = createGym(ownerToken, "Non Owner Promote Gym");
        String gymId = gym[0];
        joinGym(memberToken, gym[1]);
        String memberUserId = currentUserId(memberToken);

        mockMvc.perform(patch("/api/v1/gyms/" + gymId + "/members/" + memberUserId)
                        .header("Authorization", bearer(memberToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("role", "trainer"))))
                .andExpect(status().isForbidden());
    }

    /** Returns {gymId, inviteCode}. */
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
