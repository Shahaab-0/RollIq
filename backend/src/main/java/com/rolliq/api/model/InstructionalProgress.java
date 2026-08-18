package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

// Owned by user_id, same shape as every other per-user table -- unlike
// Instructional/InstructionalVideo, this one IS ownership-checked. Tracked
// per video (not per series) and always set manually by the user.
@Getter
@Setter
@Entity
@Table(name = "instructional_progress")
public class InstructionalProgress extends AuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "video_id", nullable = false)
    private UUID videoId;

    @Column(nullable = false)
    private String status;

    private String notes;
}
