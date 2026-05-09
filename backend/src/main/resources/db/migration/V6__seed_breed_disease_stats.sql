-- Maine Coon
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.30, 'HIGH', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2716148/'
FROM breed b, disease d WHERE b.name = 'Maine Coon' AND d.name = 'Hypertrophic Cardiomyopathy';

INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.18, 'MEDIUM', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hip-dysplasia-cats'
FROM breed b, disease d WHERE b.name = 'Maine Coon' AND d.name = 'Hip Dysplasia';

INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.10, 'HIGH', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2754405/'
FROM breed b, disease d WHERE b.name = 'Maine Coon' AND d.name = 'Spinal Muscular Atrophy';

-- Persian
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.38, 'HIGH', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/polycystic-kidney-disease'
FROM breed b, disease d WHERE b.name = 'Persian' AND d.name = 'Polycystic Kidney Disease';

INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.20, 'HIGH', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy'
FROM breed b, disease d WHERE b.name = 'Persian' AND d.name = 'Hypertrophic Cardiomyopathy';

-- Siamese
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.15, 'MEDIUM', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3354527/'
FROM breed b, disease d WHERE b.name = 'Siamese' AND d.name = 'Progressive Retinal Atrophy';

INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.10, 'MEDIUM', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy'
FROM breed b, disease d WHERE b.name = 'Siamese' AND d.name = 'Hypertrophic Cardiomyopathy';

-- Ragdoll
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.25, 'HIGH', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2716148/'
FROM breed b, disease d WHERE b.name = 'Ragdoll' AND d.name = 'Hypertrophic Cardiomyopathy';

-- Bengal
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.20, 'MEDIUM', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3354527/'
FROM breed b, disease d WHERE b.name = 'Bengal' AND d.name = 'Progressive Retinal Atrophy';

INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.25, 'MEDIUM', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3248768/'
FROM breed b, disease d WHERE b.name = 'Bengal' AND d.name = 'Pyruvate Kinase Deficiency';

INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.12, 'MEDIUM', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy'
FROM breed b, disease d WHERE b.name = 'Bengal' AND d.name = 'Hypertrophic Cardiomyopathy';

-- British Shorthair
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.20, 'HIGH', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy'
FROM breed b, disease d WHERE b.name = 'British Shorthair' AND d.name = 'Hypertrophic Cardiomyopathy';

INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.10, 'MEDIUM', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/polycystic-kidney-disease'
FROM breed b, disease d WHERE b.name = 'British Shorthair' AND d.name = 'Polycystic Kidney Disease';

-- Scottish Fold
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 1.00, 'HIGH', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7327484/'
FROM breed b, disease d WHERE b.name = 'Scottish Fold' AND d.name = 'Osteochondrodysplasia';

INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.15, 'MEDIUM', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy'
FROM breed b, disease d WHERE b.name = 'Scottish Fold' AND d.name = 'Hypertrophic Cardiomyopathy';

-- Sphynx
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.35, 'HIGH', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy'
FROM breed b, disease d WHERE b.name = 'Sphynx' AND d.name = 'Hypertrophic Cardiomyopathy';

-- Abyssinian
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.25, 'HIGH', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3354527/'
FROM breed b, disease d WHERE b.name = 'Abyssinian' AND d.name = 'Progressive Retinal Atrophy';

INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.30, 'HIGH', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3248768/'
FROM breed b, disease d WHERE b.name = 'Abyssinian' AND d.name = 'Pyruvate Kinase Deficiency';

-- Norwegian Forest Cat
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.20, 'MEDIUM', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy'
FROM breed b, disease d WHERE b.name = 'Norwegian Forest Cat' AND d.name = 'Hypertrophic Cardiomyopathy';

-- Burmese
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.12, 'MEDIUM', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy'
FROM breed b, disease d WHERE b.name = 'Burmese' AND d.name = 'Hypertrophic Cardiomyopathy';

-- Turkish Van
INSERT INTO breed_disease_stats (breed_id, disease_id, prevalence_rate, severity, source_url)
SELECT b.id, d.id, 0.15, 'MEDIUM', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy'
FROM breed b, disease d WHERE b.name = 'Turkish Van' AND d.name = 'Hypertrophic Cardiomyopathy';
