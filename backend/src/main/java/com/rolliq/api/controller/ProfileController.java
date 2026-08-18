package com.rolliq.api.controller;

import com.rolliq.api.dto.profile.ProfileResponse;
import com.rolliq.api.dto.profile.UpdateProfileRequest;
import com.rolliq.api.security.CurrentUser;
import com.rolliq.api.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final CurrentUser currentUser;

    @GetMapping("/me")
    public ProfileResponse me() {
        return profileService.getOrCreate(currentUser.id());
    }

    @PatchMapping("/me")
    public ProfileResponse update(@RequestBody UpdateProfileRequest request) {
        return profileService.update(currentUser.id(), request);
    }
}
