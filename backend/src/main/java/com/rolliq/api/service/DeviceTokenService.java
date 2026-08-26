package com.rolliq.api.service;

import com.rolliq.api.dto.devicetoken.RegisterDeviceTokenRequest;
import com.rolliq.api.model.DeviceToken;
import com.rolliq.api.repository.DeviceTokenRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;

    // Upsert on the token itself, not on (userId, token) -- if this exact
    // token turns up under a different account (e.g. a sign-out/sign-in on
    // the same device), re-registering should move it, not violate the
    // token's global unique constraint.
    @Transactional
    public void register(UUID userId, RegisterDeviceTokenRequest request) {
        DeviceToken deviceToken =
                deviceTokenRepository.findByToken(request.token()).orElseGet(DeviceToken::new);
        deviceToken.setUserId(userId);
        deviceToken.setToken(request.token());
        deviceToken.setPlatform(request.platform());
        deviceTokenRepository.save(deviceToken);
    }

    @Transactional
    public void unregister(UUID userId, String token) {
        deviceTokenRepository.deleteByUserIdAndToken(userId, token);
    }
}
