package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "techniques")
public class Technique extends AuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    // Free text, not an enum -- users add positions beyond the built-in
    // presets (RN side: POSITION_PRESETS is a display hint, not a schema
    // constraint).
    @Column(nullable = false)
    private String position;

    private String notes;

    @Column(name = "resource_url")
    private String resourceUrl;

    @Column(name = "drill_count", nullable = false)
    private int drillCount = 0;
}
