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
@Table(name = "competition_matches")
public class CompetitionMatch extends AuditableEntity {

    @Column(name = "competition_id", nullable = false)
    private UUID competitionId;

    @Column(name = "opponent_name", nullable = false)
    private String opponentName;

    @Column(nullable = false)
    private String result;

    // Free text -- "Submission - Armbar", "Points", "Referee Decision", "DQ",
    // etc. Not an enum since the space of methods is open-ended.
    private String method;

    @Column(name = "match_order", nullable = false)
    private int matchOrder;

    private String notes;
}
