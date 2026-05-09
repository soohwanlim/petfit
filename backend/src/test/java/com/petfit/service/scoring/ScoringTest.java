package com.petfit.service.scoring;

import com.petfit.domain.Breed;
import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.Disease;
import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.Rider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class ScoringTest {

    private DiseaseMatchScoreCalculator matchCalc;
    private SeverityWeightScoreCalculator severityCalc;
    private CompositeScoreCalculator composite;

    private BreedDiseaseStats hcmStat;
    private BreedDiseaseStats pkdStat;

    @BeforeEach
    void setUp() {
        matchCalc = new DiseaseMatchScoreCalculator();
        severityCalc = new SeverityWeightScoreCalculator();
        composite = new CompositeScoreCalculator(List.of(matchCalc, severityCalc));

        Breed maineCoon = new Breed();
        maineCoon.setName("Maine Coon");

        Disease hcm = new Disease();
        hcm.setName("Hypertrophic Cardiomyopathy");
        hcm.setSourceUrl("https://example.com/hcm");

        Disease pkd = new Disease();
        pkd.setName("Polycystic Kidney Disease");
        pkd.setSourceUrl("https://example.com/pkd");

        hcmStat = new BreedDiseaseStats();
        hcmStat.setBreed(maineCoon);
        hcmStat.setDisease(hcm);
        hcmStat.setPrevalenceRate(0.30);
        hcmStat.setSeverity(BreedDiseaseStats.Severity.HIGH);
        hcmStat.setSourceUrl("https://example.com/hcm");

        pkdStat = new BreedDiseaseStats();
        pkdStat.setBreed(maineCoon);
        pkdStat.setDisease(pkd);
        pkdStat.setPrevalenceRate(0.20);
        pkdStat.setSeverity(BreedDiseaseStats.Severity.MEDIUM);
        pkdStat.setSourceUrl("https://example.com/pkd");
    }

    @Test
    void fullCoverageScores100() {
        InsuranceProduct full = productWithRider("All Diseases",
                List.of("Hypertrophic Cardiomyopathy", "Polycystic Kidney Disease"));

        assertThat(matchCalc.calculate(List.of(hcmStat, pkdStat), full)).isEqualTo(100.0);
        assertThat(severityCalc.calculate(List.of(hcmStat, pkdStat), full)).isEqualTo(100.0);
        assertThat(composite.calculate(List.of(hcmStat, pkdStat), full)).isEqualTo(100.0);
    }

    @Test
    void noCoverageScores0() {
        InsuranceProduct none = productWithRider("Irrelevant", List.of("Hip Dysplasia"));

        assertThat(matchCalc.calculate(List.of(hcmStat, pkdStat), none)).isEqualTo(0.0);
        assertThat(severityCalc.calculate(List.of(hcmStat, pkdStat), none)).isEqualTo(0.0);
        assertThat(composite.calculate(List.of(hcmStat, pkdStat), none)).isEqualTo(0.0);
    }

    @Test
    void partialCoverageRanksHigherThanNone() {
        InsuranceProduct partial = productWithRider("Cardiac", List.of("Hypertrophic Cardiomyopathy"));
        InsuranceProduct none    = productWithRider("Irrelevant", List.of());

        double partialScore = composite.calculate(List.of(hcmStat, pkdStat), partial);
        double noneScore    = composite.calculate(List.of(hcmStat, pkdStat), none);

        assertThat(partialScore).isGreaterThan(noneScore);
    }

    @Test
    void highSeverityDiseaseWeighsMoreThanMedium() {
        // product A covers only HCM (HIGH severity, prevalence 0.30)
        // product B covers only PKD (MEDIUM severity, prevalence 0.20)
        // A should score higher than B on severity-weighted calculator
        InsuranceProduct coversHcm = productWithRider("Cardiac", List.of("Hypertrophic Cardiomyopathy"));
        InsuranceProduct coversPkd = productWithRider("Renal",   List.of("Polycystic Kidney Disease"));

        double hcmScore = severityCalc.calculate(List.of(hcmStat, pkdStat), coversHcm);
        double pkdScore = severityCalc.calculate(List.of(hcmStat, pkdStat), coversPkd);

        assertThat(hcmScore).isGreaterThan(pkdScore);
    }

    @Test
    void emptyBreedStatsAlwaysScoresZero() {
        InsuranceProduct any = productWithRider("Any", List.of("Hypertrophic Cardiomyopathy"));

        assertThat(matchCalc.calculate(List.of(), any)).isEqualTo(0.0);
        assertThat(severityCalc.calculate(List.of(), any)).isEqualTo(0.0);
        assertThat(composite.calculate(List.of(), any)).isEqualTo(0.0);
    }

    @Test
    void noRidersScoresZero() {
        InsuranceProduct noRiders = new InsuranceProduct();
        noRiders.setProductName("BasicPaws");
        noRiders.setRiders(List.of());

        assertThat(composite.calculate(List.of(hcmStat, pkdStat), noRiders)).isEqualTo(0.0);
    }

    private InsuranceProduct productWithRider(String riderName, List<String> diseases) {
        InsuranceProduct p = new InsuranceProduct();
        p.setProductName("Test Product");
        p.setRiders(List.of(new Rider(riderName, diseases, 5000.0)));
        return p;
    }
}
