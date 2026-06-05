package com.petfit.service.scoring;

import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.ScoreContext;

public interface ScoreCalculator {
    double calculate(ScoreContext ctx, InsuranceProduct product);
}
