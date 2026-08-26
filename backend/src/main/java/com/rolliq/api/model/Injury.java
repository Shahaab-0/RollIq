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
@Table(name = "injuries")
public class Injury extends AuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // Free text, not an enum -- same reasoning as Technique.position.
    @Column(name = "body_part", nullable = false)
    private String bodyPart;

    @Column(nullable = false)
    private String description;

    @Column(name = "injury_date", nullable = false)
    private LocalDate injuryDate;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false)
    private String status;

    private String notes;
}
