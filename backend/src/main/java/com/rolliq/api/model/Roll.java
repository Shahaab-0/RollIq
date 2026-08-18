package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Entity
@Table(name = "rolls")
public class Roll extends AuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // Nullable and set-null-on-delete: a roll's history is meaningful on
    // its own even if the session log entry it happened during is deleted.
    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "partner_name")
    private String partnerName;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "submissions_landed", nullable = false)
    private List<String> submissionsLanded = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "submissions_received", nullable = false)
    private List<String> submissionsReceived = new ArrayList<>();

    @Column(nullable = false)
    private int escapes = 0;

    @Column(name = "effort_rating")
    private Integer effortRating;

    private String notes;
}
