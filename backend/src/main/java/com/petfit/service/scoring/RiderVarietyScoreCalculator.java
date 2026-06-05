package com.petfit.service.scoring;

import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.ScoreContext;
import org.springframework.stereotype.Component;

@Component
public class RiderVarietyScoreCalculator implements ScoreCalculator {

    @Override
    public double calculate(ScoreContext ctx, InsuranceProduct product) {
        return Math.min((double) product.getRiders().size() / 8 * 5, 5);
    }
}
