package com.petfit.service.scoring;

import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.ScoreContext;
import org.springframework.stereotype.Component;

@Component
public class CoverageScoreCalculator implements ScoreCalculator {

    @Override
    public double calculate(ScoreContext ctx, InsuranceProduct product) {
        return (product.getCoverageRatio() != null ? product.getCoverageRatio() : 0.65) * 20;
    }
}
