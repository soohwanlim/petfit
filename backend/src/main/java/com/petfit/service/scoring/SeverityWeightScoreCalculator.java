package com.petfit.service.scoring;

import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.InsuranceProduct;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class SeverityWeightScoreCalculator implements ScoreCalculator {

    @Override
    public double calculate(List<BreedDiseaseStats> breedStats, InsuranceProduct product) {
        if (breedStats.isEmpty()) return 0;

        Set<String> covered = product.getRiders().stream()
                .flatMap(r -> r.getCoveredDiseases().stream())
                .collect(Collectors.toSet());

        double coveredWeight = breedStats.stream()
                .filter(s -> covered.contains(s.getDisease().getName()))
                .mapToDouble(s -> severityWeight(s.getSeverity()) * s.getPrevalenceRate())
                .sum();

        double totalWeight = breedStats.stream()
                .mapToDouble(s -> severityWeight(s.getSeverity()) * s.getPrevalenceRate())
                .sum();

        return totalWeight == 0 ? 0 : (coveredWeight / totalWeight) * 100.0;
    }

    private double severityWeight(BreedDiseaseStats.Severity severity) {
        return switch (severity) {
            case HIGH   -> 3.0;
            case MEDIUM -> 2.0;
            case LOW    -> 1.0;
        };
    }
}
