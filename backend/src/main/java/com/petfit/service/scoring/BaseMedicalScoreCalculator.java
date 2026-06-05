package com.petfit.service.scoring;

import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.ScoreContext;
import org.springframework.stereotype.Component;

@Component
public class BaseMedicalScoreCalculator implements ScoreCalculator {

    @Override
    public double calculate(ScoreContext ctx, InsuranceProduct product) {
        boolean hasMedical = product.getRiders().stream()
                .anyMatch(r -> r.getCoveredDiseases() != null && !r.getCoveredDiseases().isEmpty());
        return hasMedical ? 10 : 0;
    }
}
