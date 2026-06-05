package com.petfit.service.scoring;

import com.petfit.domain.Breed;
import com.petfit.domain.BreedDiseaseStats;
import com.petfit.domain.Disease;
import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.Rider;
import com.petfit.domain.ScoreContext;
import com.petfit.domain.ScoreResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ScoringTest {

    private DiseaseMatchScoreCalculator diseaseMatchCalc;
    private IllnessBoostScoreCalculator illnessBoostCalc;
    private CoverageScoreCalculator coverageCalc;
    private BaseMedicalScoreCalculator baseMedicalCalc;
    private RiderVarietyScoreCalculator varietyCalc;
    private WaitingPenaltyScoreCalculator waitingPenaltyCalc;
    private CompositeScoreCalculator composite;

    private BreedDiseaseStats hcmStat;
    private BreedDiseaseStats pkdStat;

    @BeforeEach
    void setUp() {
        diseaseMatchCalc   = new DiseaseMatchScoreCalculator();
        illnessBoostCalc   = new IllnessBoostScoreCalculator();
        coverageCalc       = new CoverageScoreCalculator();
        baseMedicalCalc    = new BaseMedicalScoreCalculator();
        varietyCalc        = new RiderVarietyScoreCalculator();
        waitingPenaltyCalc = new WaitingPenaltyScoreCalculator();
        composite = new CompositeScoreCalculator(
                diseaseMatchCalc, illnessBoostCalc, coverageCalc,
                baseMedicalCalc, varietyCalc, waitingPenaltyCalc);

        Breed maineCoon = new Breed();
        maineCoon.setName("Maine Coon");

        Disease hcm = new Disease();
        hcm.setId(1L);
        hcm.setName("Hypertrophic Cardiomyopathy");
        hcm.setKoreanName("비대성심근증");
        hcm.setTypicalOnsetAge(5.0);
        hcm.setSourceUrl("https://example.com/hcm");

        Disease pkd = new Disease();
        pkd.setId(2L);
        pkd.setName("Polycystic Kidney Disease");
        pkd.setKoreanName("다낭성신장질환");
        pkd.setTypicalOnsetAge(4.0);
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
    void diseaseMatchScoreIncreasesWithCoverage() {
        ScoreContext ctx = new ScoreContext(List.of(hcmStat, pkdStat), null, List.of());
        InsuranceProduct full = product("All Diseases", List.of("Hypertrophic Cardiomyopathy", "Polycystic Kidney Disease"), null, null);
        InsuranceProduct none = product("Irrelevant", List.of("Hip Dysplasia"), null, null);

        assertThat(diseaseMatchCalc.calculate(ctx, full))
                .isGreaterThan(diseaseMatchCalc.calculate(ctx, none));
    }

    @Test
    void illnessBoostRewardsMatchingCategory() {
        ScoreContext ctx = new ScoreContext(List.of(hcmStat), null, List.of("심장/순환기"));
        InsuranceProduct withCat    = product("Cardiac", List.of(), List.of("심장/순환기"), null);
        InsuranceProduct withoutCat = product("Other",   List.of(), List.of("비뇨기"), null);

        assertThat(illnessBoostCalc.calculate(ctx, withCat))
                .isGreaterThan(illnessBoostCalc.calculate(ctx, withoutCat));
    }

    @Test
    void waitingPenaltyAppliedWhenEffectiveAgeExceedsOnset() {
        // catAge=4, HCM onsetAge=5, waiting=24mo → effectiveAge=6 > 5 → penalty
        ScoreContext ctx = new ScoreContext(List.of(hcmStat), 4.0, List.of());
        InsuranceProduct longWait  = product("Cardiac", List.of("Hypertrophic Cardiomyopathy"), null, 24);
        InsuranceProduct shortWait = product("Cardiac", List.of("Hypertrophic Cardiomyopathy"), null, 1);

        assertThat(waitingPenaltyCalc.calculate(ctx, longWait))
                .isGreaterThan(waitingPenaltyCalc.calculate(ctx, shortWait));
    }

    @Test
    void noCatAgeSkipsWaitingPenalty() {
        ScoreContext ctx = new ScoreContext(List.of(hcmStat), null, List.of());
        InsuranceProduct p = product("Cardiac", List.of("Hypertrophic Cardiomyopathy"), null, 24);

        assertThat(waitingPenaltyCalc.calculate(ctx, p)).isEqualTo(0.0);
    }

    @Test
    void partialCoverageScoresHigherThanNone() {
        ScoreContext ctx = new ScoreContext(List.of(hcmStat, pkdStat), null, List.of());
        InsuranceProduct partial = product("Cardiac", List.of("Hypertrophic Cardiomyopathy"), null, null);
        InsuranceProduct none    = product("Irrelevant", List.of(), null, null);

        assertThat(composite.score(ctx, partial).getScore())
                .isGreaterThan(composite.score(ctx, none).getScore());
    }

    @Test
    void compositeScoreIsClamped0To100() {
        ScoreContext ctx = new ScoreContext(List.of(hcmStat, pkdStat), null, List.of());
        InsuranceProduct full = product("All", List.of("Hypertrophic Cardiomyopathy", "Polycystic Kidney Disease"), null, null);

        ScoreResult result = composite.score(ctx, full);
        assertThat(result.getScore()).isBetween(0, 100);
        assertThat(result.getMatchedRiders()).contains("All");
    }

    @Test
    void emptyStatsScores0ForDiseaseMatch() {
        ScoreContext ctx = new ScoreContext(List.of(), null, List.of());
        InsuranceProduct p = product("Any", List.of("Hypertrophic Cardiomyopathy"), null, null);

        assertThat(diseaseMatchCalc.calculate(ctx, p)).isEqualTo(0.0);
    }

    private InsuranceProduct product(String riderName, List<String> diseases,
                                      List<String> illnessCategories, Integer waitingMonths) {
        InsuranceProduct p = new InsuranceProduct();
        p.setProductName("Test Product");
        Rider rider = new Rider();
        rider.setRiderName(riderName);
        rider.setCoveredDiseases(diseases);
        rider.setIllnessCategories(illnessCategories);
        rider.setWaitingMonths(waitingMonths);
        p.setRiders(List.of(rider));
        return p;
    }
}
