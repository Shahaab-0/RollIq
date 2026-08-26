package com.rolliq.api.dto.roll;

public record PartnerHistoryResponse(
        String partnerName, long rollCount, long landedTotal, long receivedTotal) {}
