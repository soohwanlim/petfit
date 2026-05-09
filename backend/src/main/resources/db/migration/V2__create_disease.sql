CREATE TABLE disease (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    source_url  VARCHAR(500) NOT NULL,
    PRIMARY KEY (id)
);
