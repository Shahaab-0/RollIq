package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

// A "class recap" -- what a gym session covered. Posted by an owner/trainer,
// read by any member. Append-only from the UI's perspective (create/delete,
// no update), same shape as BeltPromotion.
@Getter
@Setter
@Entity
@Table(name = "gym_class_entries")
public class GymClassEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "class_date", nullable = false)
    private LocalDate classDate;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
