package com.petfit.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rider {

    private String riderName;
    private List<String> coveredDiseases;
    private Double coverageLimit;
    private Integer waitingMonths;
    private List<String> illnessCategories;
}
