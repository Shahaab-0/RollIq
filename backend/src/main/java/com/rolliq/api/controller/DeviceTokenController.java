package com.rolliq.api.controller;

import com.rolliq.api.dto.devicetoken.RegisterDeviceTokenRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.DeviceTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/device-tokens")
@RequiredArgsConstructor
public class DeviceTokenController {

    private final DeviceTokenService deviceTokenService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterDeviceTokenRequest request) {
        deviceTokenService.register(currentUser.id(), request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Void> unregister(@PathVariable String token) {
        deviceTokenService.unregister(currentUser.id(), token);
        return ResponseEntity.noContent().build();
    }
}
