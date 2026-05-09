package com.petfit.controller.dto;

import java.util.List;

public record ProductDto(
        String id,
        String productName,
        String provider,
        Double monthlyPremium,
        List<RiderDto> riders
) {}
