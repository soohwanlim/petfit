package com.petfit.config;

import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.Rider;
import com.petfit.repository.mongo.InsuranceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MongoDataLoader implements CommandLineRunner {

    private final InsuranceProductRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;
        repository.saveAll(buildProducts());
    }

    private List<InsuranceProduct> buildProducts() {
        return List.of(
            product("PawShield Premium", "PetFirst", 45.00, List.of(
                rider("Cardiac Care",     List.of("Hypertrophic Cardiomyopathy"),                        5000.00),
                rider("Renal Protection", List.of("Polycystic Kidney Disease"),                          4000.00)
            )),
            product("FelineFlex Basic", "Nationwide", 28.00, List.of(
                rider("Cardiac Care",     List.of("Hypertrophic Cardiomyopathy"),                        3000.00)
            )),
            product("CatGuard Complete", "Trupanion", 65.00, List.of(
                rider("Cardiac Care",     List.of("Hypertrophic Cardiomyopathy"),                        6000.00),
                rider("Eye Care",         List.of("Progressive Retinal Atrophy"),                        2500.00),
                rider("Joint Shield",     List.of("Hip Dysplasia", "Osteochondrodysplasia"),             3500.00)
            )),
            product("GenoCare Specialist", "Figo", 85.00, List.of(
                rider("Cardiac Elite",    List.of("Hypertrophic Cardiomyopathy"),                        8000.00),
                rider("Kidney Guard",     List.of("Polycystic Kidney Disease"),                          6000.00),
                rider("Vision Care",      List.of("Progressive Retinal Atrophy"),                        4000.00),
                rider("Blood Disorder",   List.of("Pyruvate Kinase Deficiency", "Spinal Muscular Atrophy"), 5000.00)
            )),
            product("BasicPaws", "Petplan", 18.00, List.of()),
            product("BreedGuard Pro", "ASPCA", 95.00, List.of(
                rider("Comprehensive Genetic", List.of(
                    "Hypertrophic Cardiomyopathy",
                    "Polycystic Kidney Disease",
                    "Progressive Retinal Atrophy",
                    "Pyruvate Kinase Deficiency",
                    "Spinal Muscular Atrophy",
                    "Osteochondrodysplasia"
                ), 10000.00)
            )),
            product("HeartFirst", "Healthy Paws", 55.00, List.of(
                rider("Cardiac Elite",    List.of("Hypertrophic Cardiomyopathy", "Spinal Muscular Atrophy"), 7000.00)
            )),
            product("KidneyShield Plus", "MetLife", 42.00, List.of(
                rider("Renal Care",       List.of("Polycystic Kidney Disease"),                          5000.00),
                rider("Metabolic Support", List.of("Pyruvate Kinase Deficiency"),                        3000.00)
            ))
        );
    }

    private InsuranceProduct product(String name, String provider, double premium, List<Rider> riders) {
        InsuranceProduct p = new InsuranceProduct();
        p.setProductName(name);
        p.setProvider(provider);
        p.setMonthlyPremium(premium);
        p.setRiders(riders);
        return p;
    }

    private Rider rider(String name, List<String> diseases, double limit) {
        return new Rider(name, diseases, limit);
    }
}
