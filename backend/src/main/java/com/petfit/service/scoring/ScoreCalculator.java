package com.petfit.service.scoring;

import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.InsuranceProduct;

import java.util.List;

public interface ScoreCalculator {
    double calculate(List<BreedDiseaseStats> breedStats, InsuranceProduct product);
}
