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

// One row per video/volume within an Instructional series. Shared, like its
// parent -- url points at wherever the video actually lives; RollIQ never
// stores the video itself.
@Getter
@Setter
@Entity
@Table(name = "instructional_videos")
public class InstructionalVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "instructional_id", nullable = false)
    private UUID instructionalId;

    @Column(nullable = false)
    private String title;

    @Column(name = "sequence_number", nullable = false)
    private int sequenceNumber;

    private String url;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
