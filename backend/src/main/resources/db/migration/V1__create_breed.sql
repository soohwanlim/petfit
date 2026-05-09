CREATE TABLE breed (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    PRIMARY KEY (id),
    UNIQUE KEY uq_breed_name (name)
);
