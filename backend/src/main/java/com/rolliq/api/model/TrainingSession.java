package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "training_sessions")
public class TrainingSession extends AuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private boolean gi;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "session_type", nullable = false)
    private String sessionType;

    private String instructor;

    private String notes;

    @Column(name = "rounds_count")
    private Integer roundsCount;

    @Column(name = "round_minutes")
    private Integer roundMinutes;

    @Column(name = "productivity_rating")
    private Integer productivityRating;

    @Column(name = "submissions_landed_count")
    private Integer submissionsLandedCount;
}
