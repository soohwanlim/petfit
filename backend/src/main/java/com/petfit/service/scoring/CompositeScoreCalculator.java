package com.petfit.service.scoring;

import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.InsuranceProduct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompositeScoreCalculator {

    private final List<ScoreCalculator> calculators;

    public double calculate(List<BreedDiseaseStats> breedStats, InsuranceProduct product) {
        if (calculators.isEmpty()) return 0;
        return calculators.stream()
                .mapToDouble(c -> c.calculate(breedStats, product))
                .average()
                .orElse(0);
    }
}
