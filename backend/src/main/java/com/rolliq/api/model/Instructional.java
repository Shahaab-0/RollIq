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

// Shared catalog entry -- NOT user-owned, unlike every other entity in this
// app. createdBy just records who added it; ownership checks don't apply to
// reads (every signed-in user browses the same catalog).
@Getter
@Setter
@Entity
@Table(name = "instructionals")
public class Instructional {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String instructor;

    // Free text, not an enum -- same reasoning as Technique.position.
    @Column(nullable = false)
    private String category;

    // Fixed set (beginner/intermediate/advanced), unlike category -- checked
    // at the database level, see V4__instructional_difficulty.sql.
    @Column(nullable = false)
    private String difficulty;

    private String platform;

    private String url;

    private String description;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
