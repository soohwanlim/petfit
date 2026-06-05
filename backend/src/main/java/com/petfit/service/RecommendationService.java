package com.petfit.service;

import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.ScoreContext;
import com.petfit.domain.ScoreResult;
import com.petfit.repository.mongo.InsuranceProductRepository;
import com.petfit.repository.mysql.BreedDiseaseStatsRepository;
import com.petfit.service.scoring.CompositeScoreCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BreedDiseaseStatsRepository statsRepository;
    private final InsuranceProductRepository productRepository;
    private final CompositeScoreCalculator compositeCalculator;

    @Transactional(readOnly = true)
    public List<ScoreResult> getRecommendations(Long breedId, Double catAge, List<String> illnesses) {
        List<BreedDiseaseStats> stats = statsRepository.findByBreedIdWithDisease(breedId);
        List<InsuranceProduct> products = productRepository.findAll();
        ScoreContext ctx = new ScoreContext(stats, catAge, illnesses != null ? illnesses : List.of());

        return products.stream()
                .map(product -> compositeCalculator.score(ctx, product))
                .sorted(Comparator.comparingInt(ScoreResult::getScore).reversed())
                .collect(Collectors.toList());
    }
}
