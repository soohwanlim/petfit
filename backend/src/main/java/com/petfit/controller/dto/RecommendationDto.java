package com.petfit.controller.dto;

import java.util.List;

public record RecommendationDto(
        String productId,
        String productName,
        String provider,
        Double monthlyPremium,
        double score,
        List<String> matchedRiders
) {}
