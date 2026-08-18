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

// The app's first role concept: owner (gym creator), trainer (promoted by
// the owner), member (joined via invite code). GymAccessService reads this
// table to authorize every gym-scoped write.
@Getter
@Setter
@Entity
@Table(name = "gym_memberships")
public class GymMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String role;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = Instant.now();
    }
}
