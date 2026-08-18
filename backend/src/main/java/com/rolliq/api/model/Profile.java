package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "profiles")
public class Profile {

    // Shares its primary key with the owning user (profiles.id references
    // users.id) rather than having its own generated id.
    @Id
    private UUID id;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "current_belt", nullable = false)
    private String currentBelt = "white";

    @Column(name = "current_stripes", nullable = false)
    private int currentStripes = 0;

    @Column(name = "home_gym")
    private String homeGym;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
