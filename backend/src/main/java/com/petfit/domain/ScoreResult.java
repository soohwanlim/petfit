package com.petfit.domain;

import lombok.Value;

import java.util.List;

@Value
public class ScoreResult {
    InsuranceProduct product;
    int score;
    ScoreBreakdown breakdown;
    List<String> matchedRiders;
    List<String> illnessRiders;
    List<String> waitingWarnings;
}
