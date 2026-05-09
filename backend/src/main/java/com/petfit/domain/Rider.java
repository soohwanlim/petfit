package com.petfit.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rider {

    private String riderName;
    private List<String> coveredDiseases;
    private Double coverageLimit;
}
