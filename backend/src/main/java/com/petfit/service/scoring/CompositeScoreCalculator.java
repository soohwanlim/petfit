package com.petfit.service.scoring;

import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.Rider;
import com.petfit.domain.ScoreBreakdown;
import com.petfit.domain.ScoreContext;
import com.petfit.domain.ScoreResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompositeScoreCalculator {

    private final DiseaseMatchScoreCalculator diseaseMatchCalc;
    private final IllnessBoostScoreCalculator illnessBoostCalc;
    private final CoverageScoreCalculator coverageCalc;
    private final BaseMedicalScoreCalculator baseMedicalCalc;
    private final RiderVarietyScoreCalculator varietyCalc;
    private final WaitingPenaltyScoreCalculator waitingPenaltyCalc;

    public ScoreResult score(ScoreContext ctx, InsuranceProduct product) {
        double diseaseScore   = diseaseMatchCalc.calculate(ctx, product);
        double illnessBoost   = illnessBoostCalc.calculate(ctx, product);
        double coverageScore  = coverageCalc.calculate(ctx, product);
        double baseMedical    = baseMedicalCalc.calculate(ctx, product);
        double variety        = varietyCalc.calculate(ctx, product);
        double waitingPenalty = waitingPenaltyCalc.calculate(ctx, product);

        int total = (int) Math.max(0, Math.min(100,
                Math.round(diseaseScore + illnessBoost + coverageScore + baseMedical + variety - waitingPenalty)));

        ScoreBreakdown breakdown = computeBreakdown(product, diseaseScore, illnessBoost, waitingPenalty, ctx.getCatAge());
        List<String> matchedRiders = matchedRiderNames(ctx, product);
        List<String> illnessRiders = illnessRiderNames(ctx, product);
        List<String> warnings      = waitingPenaltyCalc.computeWarnings(ctx, product);

        return new ScoreResult(product, total, breakdown, matchedRiders, illnessRiders, warnings);
    }

    private ScoreBreakdown computeBreakdown(InsuranceProduct product, double diseaseScore,
                                             double illnessBoost, double waitingPenalty, Double catAge) {
        int riderFit = (int) Math.min(100, Math.round((diseaseScore + illnessBoost) / 65 * 100));
        int coverage = (int) Math.round((product.getCoverageRatio() != null ? product.getCoverageRatio() : 0.65) * 100);
        Integer waiting = catAge != null ? Math.max(0, (int) Math.round(100 - (waitingPenalty / 15) * 100)) : null;
        return new ScoreBreakdown(riderFit, coverage, waiting);
    }

    private List<String> matchedRiderNames(ScoreContext ctx, InsuranceProduct product) {
        Set<String> breedDiseaseNames = ctx.getStats().stream()
                .map(s -> s.getDisease().getName())
                .collect(Collectors.toSet());
        return product.getRiders().stream()
                .filter(r -> r.getCoveredDiseases() != null
                        && r.getCoveredDiseases().stream().anyMatch(breedDiseaseNames::contains))
                .map(Rider::getRiderName)
                .collect(Collectors.toList());
    }

    private List<String> illnessRiderNames(ScoreContext ctx, InsuranceProduct product) {
        if (ctx.getIllnesses() == null || ctx.getIllnesses().isEmpty()) return List.of();
        Set<String> illnessSet = new HashSet<>(ctx.getIllnesses());
        return product.getRiders().stream()
                .filter(r -> r.getIllnessCategories() != null
                        && r.getIllnessCategories().stream().anyMatch(illnessSet::contains))
                .map(Rider::getRiderName)
                .distinct()
                .collect(Collectors.toList());
    }
}
