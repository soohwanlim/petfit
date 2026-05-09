package com.petfit.service;

import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.Rider;
import com.petfit.domain.ScoreResult;
import com.petfit.repository.mongo.InsuranceProductRepository;
import com.petfit.repository.mysql.BreedDiseaseStatsRepository;
import com.petfit.service.scoring.CompositeScoreCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BreedDiseaseStatsRepository statsRepository;
    private final InsuranceProductRepository productRepository;
    private final CompositeScoreCalculator compositeCalculator;

    @Transactional(readOnly = true)
    public List<ScoreResult> getRecommendations(Long breedId) {
        List<BreedDiseaseStats> stats = statsRepository.findByBreedIdWithDisease(breedId);
        List<InsuranceProduct> products = productRepository.findAll();

        return products.stream()
                .map(product -> new ScoreResult(
                        product,
                        compositeCalculator.calculate(stats, product),
                        matchedRiderNames(stats, product)
                ))
                .sorted(Comparator.comparingDouble(ScoreResult::getScore).reversed())
                .collect(Collectors.toList());
    }

    private List<String> matchedRiderNames(List<BreedDiseaseStats> stats, InsuranceProduct product) {
        Set<String> breedDiseases = stats.stream()
                .map(s -> s.getDisease().getName())
                .collect(Collectors.toSet());

        return product.getRiders().stream()
                .filter(r -> r.getCoveredDiseases().stream().anyMatch(breedDiseases::contains))
                .map(Rider::getRiderName)
                .collect(Collectors.toList());
    }
}
