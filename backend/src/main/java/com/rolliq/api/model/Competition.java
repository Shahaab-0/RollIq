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
@Table(name = "competitions")
public class Competition extends AuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "competition_date", nullable = false)
    private LocalDate competitionDate;

    // Free text, not an enum -- weight categories vary by federation
    // (IBJJF, ADCC, local opens) same reasoning as Technique.position.
    @Column(name = "weight_category", nullable = false)
    private String weightCategory;

    @Column(name = "belt_division")
    private String beltDivision;

    private String location;

    private String notes;
}
