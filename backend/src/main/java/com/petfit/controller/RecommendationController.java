package com.petfit.controller;

import com.petfit.controller.dto.RecommendationDto;
import com.petfit.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public List<RecommendationDto> get(
            @RequestParam Long breedId,
            @RequestParam(required = false) Double catAge,
            @RequestParam(required = false) List<String> illnesses) {
        return recommendationService.getRecommendations(breedId, catAge, illnesses).stream()
                .map(r -> new RecommendationDto(
                        r.getProduct().getId(), // mapped to `id` field
                        r.getProduct().getProductName(),
                        r.getProduct().getProvider(),
                        r.getProduct().getMonthlyPremium(),
                        r.getProduct().getUrl(),
                        r.getScore(),
                        r.getBreakdown(),
                        r.getMatchedRiders(),
                        r.getIllnessRiders(),
                        r.getWaitingWarnings()
                ))
                .toList();
    }
}
