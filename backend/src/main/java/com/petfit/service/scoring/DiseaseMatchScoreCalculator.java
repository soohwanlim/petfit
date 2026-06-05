package com.petfit.service.scoring;

import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.ScoreContext;
import org.springframework.stereotype.Component;

@Component
public class DiseaseMatchScoreCalculator implements ScoreCalculator {

    private static final double MATCH_NORMALIZER = 3.5;

    @Override
    public double calculate(ScoreContext ctx, InsuranceProduct product) {
        double rawMatch = 0;
        for (BreedDiseaseStats stat : ctx.getStats()) {
            boolean covered = product.getRiders().stream()
                    .anyMatch(r -> r.getCoveredDiseases() != null
                            && r.getCoveredDiseases().contains(stat.getDisease().getName()));
            if (covered) {
                rawMatch += severityWeight(stat.getSeverity()) * stat.getPrevalenceRate();
            }
        }
        return Math.min((rawMatch / MATCH_NORMALIZER) * 50, 50);
    }

    private double severityWeight(BreedDiseaseStats.Severity severity) {
        return switch (severity) {
            case HIGH   -> 3.0;
            case MEDIUM -> 2.0;
            case LOW    -> 1.0;
        };
    }
}
