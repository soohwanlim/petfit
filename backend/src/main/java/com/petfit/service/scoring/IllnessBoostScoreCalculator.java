package com.petfit.service.scoring;

import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.ScoreContext;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class IllnessBoostScoreCalculator implements ScoreCalculator {

    @Override
    public double calculate(ScoreContext ctx, InsuranceProduct product) {
        List<String> illnesses = ctx.getIllnesses();
        if (illnesses == null || illnesses.isEmpty()) return 0;

        long coveredCount = illnesses.stream()
                .filter(illness -> product.getRiders().stream()
                        .anyMatch(r -> r.getIllnessCategories() != null
                                && r.getIllnessCategories().contains(illness)))
                .count();

        return Math.min((double) coveredCount / illnesses.size() * 15, 15);
    }
}
