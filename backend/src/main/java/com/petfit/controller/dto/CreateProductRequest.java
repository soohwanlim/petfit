package com.petfit.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateProductRequest(
        @NotBlank String productName,
        @NotBlank String provider,
        @NotNull  Double monthlyPremium,
        List<RiderDto> riders
) {}
