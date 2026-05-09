package com.petfit.service.scoring;

import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.InsuranceProduct;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DiseaseMatchScoreCalculator implements ScoreCalculator {

    @Override
    public double calculate(List<BreedDiseaseStats> breedStats, InsuranceProduct product) {
        if (breedStats.isEmpty()) return 0;

        Set<String> covered = product.getRiders().stream()
                .flatMap(r -> r.getCoveredDiseases().stream())
                .collect(Collectors.toSet());

        long matched = breedStats.stream()
                .filter(s -> covered.contains(s.getDisease().getName()))
                .count();

        return ((double) matched / breedStats.size()) * 100.0;
    }
}
