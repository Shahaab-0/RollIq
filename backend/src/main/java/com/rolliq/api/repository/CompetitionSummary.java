package com.rolliq.api.repository;

import java.time.LocalDate;
import java.util.UUID;

// Native-query projection for CompetitionRepository.findAllForUser -- adds
// win/loss/draw counts computed in SQL so the list screen doesn't need a
// separate matches fetch per competition.
public interface CompetitionSummary {
    UUID getId();

    String getName();

    LocalDate getCompetitionDate();

    String getWeightCategory();

    String getBeltDivision();

    String getLocation();

    String getNotes();

    long getMatchCount();

    long getWins();

    long getLosses();

    long getDraws();
}
