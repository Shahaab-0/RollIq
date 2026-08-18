package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProfileControllerIT extends AbstractIntegrationTest {

    @Test
    void profileIsAutoCreatedOnSignUpWithWhiteBeltDefault() throws Exception {
        String token = signUpAndGetAccessToken("profile1@example.com");

        mockMvc.perform(get("/api/v1/profile/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.current_belt").value("white"))
                .andExpect(jsonPath("$.current_stripes").value(0));
    }

    @Test
    void updateProfilePersistsChangedFields() throws Exception {
        String token = signUpAndGetAccessToken("profile2@example.com");

        mockMvc.perform(patch("/api/v1/profile/me")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("display_name", "Roll Model", "home_gym", "Downtown BJJ"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.display_name").value("Roll Model"))
                .andExpect(jsonPath("$.home_gym").value("Downtown BJJ"));
    }

    @Test
    void updateProfileWithInvalidBeltIsRejected() throws Exception {
        String token = signUpAndGetAccessToken("profile3@example.com");

        mockMvc.perform(patch("/api/v1/profile/me")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("current_belt", "rainbow"))))
                .andExpect(status().isBadRequest());
    }
}
