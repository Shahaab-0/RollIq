package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GymScheduleEntryControllerIT extends AbstractIntegrationTest {

    @Test
    void ownerCanPostAScheduleEntryPlainMemberCannotThenMembersCanReadIt() throws Exception {
        String ownerToken = signUpAndGetAccessToken("schedule-owner@example.com");
        String memberToken = signUpAndGetAccessToken("schedule-member@example.com");

        String[] gym = createGym(ownerToken, "Schedule Test Gym");
        String gymId = gym[0];
        joinGym(memberToken, gym[1]);

        mockMvc.perform(post("/api/v1/gyms/" + gymId + "/schedule")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "day_of_week", 3,
                                "start_time", "18:00:00",
                                "end_time", "19:30:00",
                                "topic", "No-Gi Fundamentals"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.day_of_week").value(3))
                .andExpect(jsonPath("$.end_time").value("19:30:00"))
                .andExpect(jsonPath("$.topic").value("No-Gi Fundamentals"));

        // topic is optional
        mockMvc.perform(post("/api/v1/gyms/" + gymId + "/schedule")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("day_of_week", 6, "start_time", "10:00:00", "end_time", "11:00:00"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.topic").doesNotExist());

        mockMvc.perform(post("/api/v1/gyms/" + gymId + "/schedule")
                        .header("Authorization", bearer(memberToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("day_of_week", 1, "start_time", "18:00:00", "end_time", "19:00:00"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/gyms/" + gymId + "/schedule").header("Authorization", bearer(memberToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void ownerCanDeleteAScheduleEntry() throws Exception {
        String ownerToken = signUpAndGetAccessToken("schedule-delete-owner@example.com");
        String[] gym = createGym(ownerToken, "Schedule Delete Gym");
        String gymId = gym[0];

        String response = mockMvc
                .perform(post("/api/v1/gyms/" + gymId + "/schedule")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("day_of_week", 2, "start_time", "19:00:00", "end_time", "20:00:00"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String entryId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(delete("/api/v1/gyms/" + gymId + "/schedule/" + entryId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/gyms/" + gymId + "/schedule").header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void endTimeMustBeAfterStartTime() throws Exception {
        String ownerToken = signUpAndGetAccessToken("schedule-badtime-owner@example.com");
        String[] gym = createGym(ownerToken, "Bad Time Gym");

        mockMvc.perform(post("/api/v1/gyms/" + gym[0] + "/schedule")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("day_of_week", 2, "start_time", "19:00:00", "end_time", "18:00:00"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nonMemberCannotListSchedule() throws Exception {
        String ownerToken = signUpAndGetAccessToken("schedule-nonmember-owner@example.com");
        String outsiderToken = signUpAndGetAccessToken("schedule-nonmember-outsider@example.com");
        String[] gym = createGym(ownerToken, "Private Schedule Gym");

        mockMvc.perform(get("/api/v1/gyms/" + gym[0] + "/schedule").header("Authorization", bearer(outsiderToken)))
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
}
