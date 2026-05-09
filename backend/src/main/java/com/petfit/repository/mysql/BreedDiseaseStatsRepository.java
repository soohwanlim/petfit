package com.petfit.repository.mysql;

import com.petfit.domain.BreedDiseaseStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BreedDiseaseStatsRepository extends JpaRepository<BreedDiseaseStats, Long> {

    @Query("SELECT s FROM BreedDiseaseStats s JOIN FETCH s.disease WHERE s.breed.id = :breedId")
    List<BreedDiseaseStats> findByBreedIdWithDisease(@Param("breedId") Long breedId);
}
