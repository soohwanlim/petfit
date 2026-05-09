package com.petfit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.petfit.repository.mysql")
@EnableMongoRepositories(basePackages = "com.petfit.repository.mongo")
public class PetFitApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetFitApplication.class, args);
    }
}
