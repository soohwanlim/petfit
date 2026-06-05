package com.petfit.controller.dto;

import com.petfit.domain.ScoreBreakdown;

import java.util.List;

public record RecommendationDto(
        String id,
        String productName,
        String provider,
        Double monthlyPremium,
        String url,
        int score,
        ScoreBreakdown breakdown,
        List<String> matchedRiders,
        List<String> illnessRiders,
        List<String> waitingWarnings
) {}
