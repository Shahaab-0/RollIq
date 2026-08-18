package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BeltPromotionControllerIT extends AbstractIntegrationTest {

    @Test
    void creatingAPromotionSyncsTheProfilesCurrentBelt() throws Exception {
        String token = signUpAndGetAccessToken("belt1@example.com");

        mockMvc.perform(post("/api/v1/belt-promotions")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("belt", "blue", "promoted_on", "2026-08-15"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.stripes").value(0));

        mockMvc.perform(get("/api/v1/profile/me").header("Authorization", bearer(token)))
                .andExpect(jsonPath("$.current_belt").value("blue"))
                .andExpect(jsonPath("$.current_stripes").value(0));
    }

    @Test
    void loggingAMilestoneDoesNotTouchTheProfile() throws Exception {
        String token = signUpAndGetAccessToken("belt2@example.com");

        mockMvc.perform(post("/api/v1/belt-promotions/milestone")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("belt", "white", "stripes", 2, "promoted_on", "2026-08-15"))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/profile/me").header("Authorization", bearer(token)))
                .andExpect(jsonPath("$.current_belt").value("white"))
                .andExpect(jsonPath("$.current_stripes").value(0));
    }
}
