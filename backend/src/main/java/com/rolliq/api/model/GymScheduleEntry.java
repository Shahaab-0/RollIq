package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

// A recurring weekly slot ("every Wednesday at 6pm") -- forward-looking,
// unlike GymClassEntry which is a retrospective recap. dayOfWeek follows
// java.time.DayOfWeek's ISO numbering (1=Monday..7=Sunday).
@Getter
@Setter
@Entity
@Table(name = "gym_schedule_entries")
public class GymScheduleEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // What's planned for this slot -- optional, per the request that came
    // with this feature ("what we're going to learn, which is optional").
    private String topic;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
