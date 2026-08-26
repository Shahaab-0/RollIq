package com.rolliq.api.repository;

// Projection for RollRepository.findPartnerHistory -- one row per distinct
// training partner (case/whitespace-normalized), aggregated across every
// roll logged against them.
public interface PartnerHistorySummary {

    String getPartnerName();

    Long getRollCount();

    Long getLandedTotal();

    Long getReceivedTotal();
}
