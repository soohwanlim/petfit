package com.petfit.controller.dto;

import java.util.List;

public record RiderDto(String riderName, List<String> coveredDiseases, Double coverageLimit) {}
