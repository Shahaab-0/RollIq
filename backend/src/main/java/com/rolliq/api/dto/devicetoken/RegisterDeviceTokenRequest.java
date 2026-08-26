package com.rolliq.api.dto.devicetoken;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterDeviceTokenRequest(
        @NotBlank String token, @NotBlank @Pattern(regexp = "ios|android") String platform) {}
