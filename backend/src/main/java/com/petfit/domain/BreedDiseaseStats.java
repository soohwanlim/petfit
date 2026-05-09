package com.petfit.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "breed_disease_stats")
@Getter
@Setter
@NoArgsConstructor
public class BreedDiseaseStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "breed_id", nullable = false)
    private Breed breed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;

    @Column(name = "prevalence_rate", nullable = false)
    private Double prevalenceRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @NotBlank
    @Column(name = "source_url", nullable = false, length = 500)
    private String sourceUrl;

    public enum Severity {
        LOW, MEDIUM, HIGH
    }
}
