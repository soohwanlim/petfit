package com.petfit.repository.mongo;

import com.petfit.domain.InsuranceProduct;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InsuranceProductRepository extends MongoRepository<InsuranceProduct, String> {
}
