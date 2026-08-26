package com.rolliq.api.service;

import com.rolliq.api.model.Gym;
import com.rolliq.api.model.GymScheduleEntry;
import com.rolliq.api.repository.GymMembershipRepository;
import com.rolliq.api.repository.GymRepository;
import com.rolliq.api.repository.GymScheduleEntryRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Every-15-minutes job: push a reminder to every member of a gym whose
// weekly schedule has a slot starting within the next hour today.
// last_reminded_on on the entry dedupes so the same slot doesn't push
// twice in one day across polling runs.
//
// Known v1 simplification: the one-hour lookahead window doesn't wrap
// across midnight (a slot starting between ~23:00 and 01:00 could be
// missed) -- fine at solo/low-user scale, same server-time-not-per-user-
// timezone caveat as StreakNotificationService.
@Service
@RequiredArgsConstructor
public class GymScheduleReminderService {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("h:mm a");

    private final GymScheduleEntryRepository scheduleRepository;
    private final GymMembershipRepository membershipRepository;
    private final GymRepository gymRepository;
    private final PushNotificationService pushNotificationService;

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void sendUpcomingClassReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        int dayOfWeek = today.getDayOfWeek().getValue();

        List<GymScheduleEntry> due =
                scheduleRepository.findDueForReminder(dayOfWeek, now, now.plusHours(1), today);
        for (GymScheduleEntry entry : due) {
            notifyGymMembers(entry);
            entry.setLastRemindedOn(today);
            scheduleRepository.save(entry);
        }
    }

    private void notifyGymMembers(GymScheduleEntry entry) {
        Gym gym = gymRepository.findById(entry.getGymId()).orElse(null);
        if (gym == null) return;

        List<UUID> memberIds =
                membershipRepository.findByGymIdOrderByJoinedAtAsc(entry.getGymId()).stream()
                        .map(m -> m.getUserId())
                        .toList();

        String time = entry.getStartTime().format(TIME_FORMAT);
        String body =
                entry.getTopic() != null
                        ? "Class starts at " + time + " — " + entry.getTopic()
                        : "Class starts at " + time;
        pushNotificationService.sendToUsers(memberIds, gym.getName(), body);
    }
}
