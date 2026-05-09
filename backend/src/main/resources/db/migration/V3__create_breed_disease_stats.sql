CREATE TABLE breed_disease_stats (
    id              BIGINT         NOT NULL AUTO_INCREMENT,
    breed_id        BIGINT         NOT NULL,
    disease_id      BIGINT         NOT NULL,
    prevalence_rate DOUBLE         NOT NULL,
    severity        ENUM('LOW','MEDIUM','HIGH') NOT NULL,
    source_url      VARCHAR(500)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_bds_breed   FOREIGN KEY (breed_id)   REFERENCES breed(id),
    CONSTRAINT fk_bds_disease FOREIGN KEY (disease_id) REFERENCES disease(id)
);
