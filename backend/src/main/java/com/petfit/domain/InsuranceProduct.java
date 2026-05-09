package com.petfit.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "insurance_products")
@Getter
@Setter
@NoArgsConstructor
public class InsuranceProduct {

    @Id
    private String id;

    private String productName;
    private String provider;
    private Double monthlyPremium;
    private List<Rider> riders = new ArrayList<>();
}
