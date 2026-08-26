package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

// One row per gym member marked present on a specific class recap.
@Getter
@Setter
@Entity
@Table(name = "gym_class_attendance")
public class GymClassAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_class_entry_id", nullable = false)
    private UUID gymClassEntryId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "marked_by")
    private UUID markedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
