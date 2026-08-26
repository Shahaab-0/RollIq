package com.rolliq.api.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;
import com.rolliq.api.model.DeviceToken;
import com.rolliq.api.repository.DeviceTokenRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

// Wraps FirebaseMessaging so callers never touch the SDK directly. Silently
// no-ops if Firebase isn't configured (see FirebaseConfig) -- a missing
// push credential should never break the feature that triggered the push.
@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final Optional<FirebaseApp> firebaseApp;

    public void sendToUser(UUID userId, String title, String body) {
        if (firebaseApp.isEmpty()) return;

        List<DeviceToken> tokens = deviceTokenRepository.findByUserId(userId);
        for (DeviceToken deviceToken : tokens) {
            send(deviceToken, title, body);
        }
    }

    public void sendToUsers(List<UUID> userIds, String title, String body) {
        userIds.forEach(userId -> sendToUser(userId, title, body));
    }

    private void send(DeviceToken deviceToken, String title, String body) {
        Message message =
                Message.builder()
                        .setToken(deviceToken.getToken())
                        .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                        .build();
        try {
            FirebaseMessaging.getInstance(firebaseApp.orElseThrow()).send(message);
        } catch (FirebaseMessagingException e) {
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                // The device uninstalled the app or the token otherwise expired --
                // prune it so future sends don't keep retrying a dead token.
                deviceTokenRepository.deleteByToken(deviceToken.getToken());
            } else {
                log.warn("Failed to send push notification to a device", e);
            }
        }
    }
}
