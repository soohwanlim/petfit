package com.petfit.service;

import com.petfit.domain.InsuranceProduct;
import com.petfit.repository.mongo.InsuranceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InsuranceProductService {

    private final InsuranceProductRepository repository;

    public List<InsuranceProduct> findAll() {
        return repository.findAll();
    }

    public InsuranceProduct save(InsuranceProduct product) {
        return repository.save(product);
    }
}
