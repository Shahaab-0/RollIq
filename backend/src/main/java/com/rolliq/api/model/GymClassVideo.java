package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

// One video within a class recap. No per-video title (the parent
// GymClassEntry has the one title for the whole session) -- just a url and
// the technique names shown in it, same text[] pattern as
// Roll.submissionsLanded/submissionsReceived.
@Getter
@Setter
@Entity
@Table(name = "gym_class_videos")
public class GymClassVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_class_entry_id", nullable = false)
    private UUID gymClassEntryId;

    private String url;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(nullable = false)
    private List<String> techniques = new ArrayList<>();

    @Column(name = "sequence_number", nullable = false)
    private int sequenceNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
