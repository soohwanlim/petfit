package com.petfit.domain;

import lombok.Value;

import java.util.List;

@Value
public class ScoreContext {
    List<BreedDiseaseStats> stats;
    Double catAge;
    List<String> illnesses;
}
