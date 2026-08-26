package com.rolliq.api.controller;

import com.rolliq.api.support.AbstractIntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DeviceTokenControllerIT extends AbstractIntegrationTest {

    @Test
    void registerIsIdempotentAndUnregisterRemovesIt() throws Exception {
        String token = signUpAndGetAccessToken("devicetoken1@example.com");

        mockMvc.perform(post("/api/v1/device-tokens")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("token", "fcm-token-abc", "platform", "ios"))))
                .andExpect(status().isNoContent());

        // registering the same token again (e.g. app relaunch) should not error
        mockMvc.perform(post("/api/v1/device-tokens")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("token", "fcm-token-abc", "platform", "ios"))))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/v1/device-tokens/fcm-token-abc")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
    }

    @Test
    void reRegisteringATokenUnderADifferentAccountMovesItRatherThanConflicting() throws Exception {
        String tokenA = signUpAndGetAccessToken("devicetoken-a@example.com");
        String tokenB = signUpAndGetAccessToken("devicetoken-b@example.com");

        mockMvc.perform(post("/api/v1/device-tokens")
                .header("Authorization", bearer(tokenA))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        Map.of("token", "shared-device-token", "platform", "android"))));

        mockMvc.perform(post("/api/v1/device-tokens")
                        .header("Authorization", bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("token", "shared-device-token", "platform", "android"))))
                .andExpect(status().isNoContent());
    }

    @Test
    void invalidPlatformIsRejected() throws Exception {
        String token = signUpAndGetAccessToken("devicetoken-badplatform@example.com");

        mockMvc.perform(post("/api/v1/device-tokens")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("token", "some-token", "platform", "windows"))))
                .andExpect(status().isBadRequest());
    }
}
