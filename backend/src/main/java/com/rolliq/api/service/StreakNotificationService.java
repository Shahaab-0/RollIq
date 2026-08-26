package com.rolliq.api.service;

import com.rolliq.api.model.TrainingSession;
import com.rolliq.api.model.User;
import com.rolliq.api.repository.TrainingSessionRepository;
import com.rolliq.api.repository.UserRepository;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

// Daily job: remind anyone with an active streak who hasn't logged a
// session today, before the streak resets at midnight. Ports the same
// "consecutive local-calendar-days with a session" logic
// frontend/src/features/dashboard/hooks/useDashboardStats.ts already
// computes client-side for the Dashboard, since nothing server-side
// computed a streak before this.
//
// Known v1 simplification: runs on server time (20:00), not per-user
// timezone -- fine at solo/low-user scale, worth revisiting if RollIQ
// gets users spread across timezones.
@Slf4j
@Service
@RequiredArgsConstructor
public class StreakNotificationService {

    private final UserRepository userRepository;
    private final TrainingSessionRepository sessionRepository;
    private final PushNotificationService pushNotificationService;

    @Scheduled(cron = "0 0 20 * * *")
    public void sendStreakReminders() {
        for (User user : userRepository.findAll()) {
            checkAndNotify(user.getId());
        }
    }

    private void checkAndNotify(UUID userId) {
        Set<LocalDate> dates = new HashSet<>();
        for (TrainingSession session : sessionRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId)) {
            dates.add(session.getDate());
        }

        LocalDate today = LocalDate.now();
        if (dates.contains(today)) return;

        int streak = 0;
        LocalDate cursor = today.minusDays(1);
        while (dates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        if (streak > 0) {
            pushNotificationService.sendToUser(
                    userId,
                    "Don't lose your streak!",
                    "You're on a " + streak + "-day streak — log today's session before it resets.");
        }
    }
}
