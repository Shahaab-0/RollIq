package com.rolliq.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "session_techniques")
public class SessionTechnique {

    @EmbeddedId
    private Id id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public SessionTechnique() {}

    public SessionTechnique(UUID sessionId, UUID techniqueId, UUID userId) {
        this.id = new Id(sessionId, techniqueId);
        this.userId = userId;
    }

    @Getter
    @Setter
    @Embeddable
    public static class Id implements Serializable {

        @Column(name = "session_id")
        private UUID sessionId;

        @Column(name = "technique_id")
        private UUID techniqueId;

        public Id() {}

        public Id(UUID sessionId, UUID techniqueId) {
            this.sessionId = sessionId;
            this.techniqueId = techniqueId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Id id)) return false;
            return Objects.equals(sessionId, id.sessionId)
                    && Objects.equals(techniqueId, id.techniqueId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(sessionId, techniqueId);
        }
    }
}
