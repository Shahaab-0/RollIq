package com.rolliq.api.repository;

import java.util.UUID;

// Projection for InstructionalRepository.findAllWithProgressSummary --
// video/completed/in-progress counts are aggregated in the query itself so
// the client never has to fetch every series' videos just to render a
// summary badge.
public interface InstructionalSummary {

    UUID getId();

    String getTitle();

    String getInstructor();

    String getCategory();

    String getDifficulty();

    String getPlatform();

    String getUrl();

    String getDescription();

    Integer getReleaseYear();

    Long getVideoCount();

    Long getCompletedCount();

    Long getInProgressCount();
}
