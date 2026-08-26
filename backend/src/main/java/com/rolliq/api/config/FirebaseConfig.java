package com.rolliq.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.io.FileInputStream;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

// Push notifications are optional infra, not a hard startup dependency.
// @ConditionalOnProperty means this bean is never even attempted -- not
// registered at all, not registered-then-null -- when
// GOOGLE_APPLICATION_CREDENTIALS isn't set (e.g. local dev before the
// Firebase Console project exists). PushNotificationService injects
// Optional<FirebaseApp> so it resolves cleanly to empty() either way.
@Slf4j
@Configuration
public class FirebaseConfig {

    @Bean
    @ConditionalOnProperty(name = "GOOGLE_APPLICATION_CREDENTIALS")
    public FirebaseApp firebaseApp(Environment env) throws IOException {
        String credentialsPath = env.getProperty("GOOGLE_APPLICATION_CREDENTIALS");
        try (FileInputStream credentialsStream = new FileInputStream(credentialsPath)) {
            FirebaseOptions options =
                    FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                            .build();
            return FirebaseApp.initializeApp(options);
        }
    }
}
