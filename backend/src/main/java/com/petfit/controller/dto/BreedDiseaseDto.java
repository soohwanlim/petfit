package com.petfit.controller.dto;

public record BreedDiseaseDto(
        Long diseaseId,
        String name,
        String koreanName,
        String severity,
        Double prevalenceRate,
        Double typicalOnsetAge
) {}
