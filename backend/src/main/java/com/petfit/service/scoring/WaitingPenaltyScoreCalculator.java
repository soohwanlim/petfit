package com.petfit.service.scoring;

import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.Disease;
import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.Rider;
import com.petfit.domain.ScoreContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class WaitingPenaltyScoreCalculator implements ScoreCalculator {

    @Override
    public double calculate(ScoreContext ctx, InsuranceProduct product) {
        if (ctx.getCatAge() == null) return 0;
        return Math.min(computePenalty(ctx, product, null), 15);
    }

    public List<String> computeWarnings(ScoreContext ctx, InsuranceProduct product) {
        if (ctx.getCatAge() == null) return List.of();
        List<String> warnings = new ArrayList<>();
        computePenalty(ctx, product, warnings);
        return warnings;
    }

    private double computePenalty(ScoreContext ctx, InsuranceProduct product, List<String> warnings) {
        Set<Long> penalized = new HashSet<>();
        double penalty = 0;

        for (BreedDiseaseStats stat : ctx.getStats()) {
            if (stat.getSeverity() == BreedDiseaseStats.Severity.LOW) continue;
            Disease disease = stat.getDisease();
            if (disease.getTypicalOnsetAge() == null || disease.getId() == null) continue;
            if (penalized.contains(disease.getId())) continue;

            List<Rider> coveringRiders = product.getRiders().stream()
                    .filter(r -> r.getCoveredDiseases() != null
                            && r.getCoveredDiseases().contains(disease.getName()))
                    .toList();
            if (coveringRiders.isEmpty()) continue;

            int minWaiting = coveringRiders.stream()
                    .mapToInt(r -> r.getWaitingMonths() != null ? r.getWaitingMonths() : 1)
                    .min().orElse(1);

            double effectiveAge = ctx.getCatAge() + minWaiting / 12.0;
            if (effectiveAge > disease.getTypicalOnsetAge()) {
                penalty += stat.getSeverity() == BreedDiseaseStats.Severity.HIGH ? 2 : 1;
                penalized.add(disease.getId());
                if (warnings != null) {
                    String name = disease.getKoreanName() != null ? disease.getKoreanName() : disease.getName();
                    warnings.add(String.format("%s: 면책기간(%d개월) 후 보장 시작 시 전형 발병 연령(%.1f세) 초과 가능",
                            name, minWaiting, disease.getTypicalOnsetAge()));
                }
            }
        }
        return penalty;
    }
}
