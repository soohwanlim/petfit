package com.petfit.domain;

import lombok.Value;

import java.util.List;

@Value
public class ScoreResult {
    InsuranceProduct product;
    double score;
    List<String> matchedRiders;
}
