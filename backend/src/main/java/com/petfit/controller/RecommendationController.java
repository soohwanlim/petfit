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
    public List<RecommendationDto> get(@RequestParam Long breedId) {
        return recommendationService.getRecommendations(breedId).stream()
                .map(r -> new RecommendationDto(
                        r.getProduct().getId(),
                        r.getProduct().getProductName(),
                        r.getProduct().getProvider(),
                        r.getProduct().getMonthlyPremium(),
                        r.getScore(),
                        r.getMatchedRiders()
                ))
                .toList();
    }
}
