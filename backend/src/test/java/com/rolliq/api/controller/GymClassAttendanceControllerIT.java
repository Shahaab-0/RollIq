package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GymClassAttendanceControllerIT extends AbstractIntegrationTest {

    @Test
    void ownerCanMarkAndUnmarkAttendancePlainMemberCannot() throws Exception {
        String ownerToken = signUpAndGetAccessToken("attendance-owner@example.com");
        String memberToken = signUpAndGetAccessToken("attendance-member@example.com");

        String[] gym = createGym(ownerToken, "Attendance Test Gym");
        String gymId = gym[0];
        joinGym(memberToken, gym[1]);
        String memberUserId = currentUserId(memberToken);
        String classId = createClass(ownerToken, gymId, "Leg Lock Night");

        mockMvc.perform(get("/api/v1/gyms/" + gymId + "/classes/" + classId + "/attendance")
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.user_id == '" + memberUserId + "')].present").value(false));

        mockMvc.perform(put("/api/v1/gyms/" + gymId + "/classes/" + classId + "/attendance/" + memberUserId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/gyms/" + gymId + "/classes/" + classId + "/attendance")
                        .header("Authorization", bearer(memberToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.user_id == '" + memberUserId + "')].present").value(true));

        mockMvc.perform(put("/api/v1/gyms/" + gymId + "/classes/" + classId + "/attendance/" + memberUserId)
                        .header("Authorization", bearer(memberToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/gyms/" + gymId + "/classes/" + classId + "/attendance/" + memberUserId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/gyms/" + gymId + "/classes/" + classId + "/attendance")
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(jsonPath("$[?(@.user_id == '" + memberUserId + "')].present").value(false));
    }

    @Test
    void markingANonMemberIsRejected() throws Exception {
        String ownerToken = signUpAndGetAccessToken("attendance-nonmember-owner@example.com");
        String outsiderToken = signUpAndGetAccessToken("attendance-nonmember-outsider@example.com");

        String[] gym = createGym(ownerToken, "Non Member Attendance Gym");
        String gymId = gym[0];
        String outsiderUserId = currentUserId(outsiderToken);
        String classId = createClass(ownerToken, gymId, "Open Mat");

        mockMvc.perform(put("/api/v1/gyms/" + gymId + "/classes/" + classId + "/attendance/" + outsiderUserId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isBadRequest());
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

    private String currentUserId(String token) throws Exception {
        String response = mockMvc
                .perform(get("/api/v1/profile/me").header("Authorization", bearer(token)))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
