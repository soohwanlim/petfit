export const diseases = [
  {
    id: 1,
    name: 'Hypertrophic Cardiomyopathy',
    koreanName: '비대성심근증',
    typicalOnsetAge: 5,
    description: 'The most common heart disease in cats; the heart muscle thickens, reducing the heart\'s efficiency.',
  },
  {
    id: 2,
    name: 'Polycystic Kidney Disease',
    koreanName: '다낭성신장질환',
    typicalOnsetAge: 4,
    description: 'Autosomal dominant condition causing fluid-filled cysts in the kidneys, leading to progressive renal failure.',
  },
  {
    id: 3,
    name: 'Progressive Retinal Atrophy',
    koreanName: '진행성망막위축',
    typicalOnsetAge: 2,
    description: 'Hereditary degeneration of the retinal photoreceptors leading to blindness.',
  },
  {
    id: 4,
    name: 'Hip Dysplasia',
    koreanName: '고관절이형성증',
    typicalOnsetAge: 2,
    description: 'Malformation of the hip joint causing pain and degenerative joint disease.',
  },
  {
    id: 5,
    name: 'Pyruvate Kinase Deficiency',
    koreanName: '피루베이트키나제결핍증',
    typicalOnsetAge: 1,
    description: 'Autosomal recessive enzyme deficiency causing haemolytic anaemia.',
  },
  {
    id: 6,
    name: 'Spinal Muscular Atrophy',
    koreanName: '척수성근위축증',
    typicalOnsetAge: 0.5,
    description: 'Loss of spinal motor neurons causing progressive muscle weakness.',
  },
  {
    id: 7,
    name: 'Osteochondrodysplasia',
    koreanName: '골연골이형성증',
    typicalOnsetAge: 1,
    description: 'Skeletal disorder caused by the same gene mutation responsible for the Scottish Fold\'s folded ears; causes painful degenerative joint disease.',
  },
]

// breedId → [{ diseaseId, prevalenceRate, severity }]
export const breedDiseaseStats = [
  // Maine Coon (1)
  { breedId: 1, diseaseId: 1, prevalenceRate: 0.30, severity: 'HIGH' },
  { breedId: 1, diseaseId: 4, prevalenceRate: 0.18, severity: 'MEDIUM' },
  { breedId: 1, diseaseId: 6, prevalenceRate: 0.10, severity: 'HIGH' },
  // Persian (2)
  { breedId: 2, diseaseId: 2, prevalenceRate: 0.38, severity: 'HIGH' },
  { breedId: 2, diseaseId: 1, prevalenceRate: 0.20, severity: 'HIGH' },
  // Siamese (3)
  { breedId: 3, diseaseId: 3, prevalenceRate: 0.15, severity: 'MEDIUM' },
  { breedId: 3, diseaseId: 1, prevalenceRate: 0.10, severity: 'MEDIUM' },
  // Ragdoll (4)
  { breedId: 4, diseaseId: 1, prevalenceRate: 0.25, severity: 'HIGH' },
  // Bengal (5)
  { breedId: 5, diseaseId: 3, prevalenceRate: 0.20, severity: 'MEDIUM' },
  { breedId: 5, diseaseId: 5, prevalenceRate: 0.25, severity: 'MEDIUM' },
  { breedId: 5, diseaseId: 1, prevalenceRate: 0.12, severity: 'MEDIUM' },
  // British Shorthair (6)
  { breedId: 6, diseaseId: 1, prevalenceRate: 0.20, severity: 'HIGH' },
  { breedId: 6, diseaseId: 2, prevalenceRate: 0.10, severity: 'MEDIUM' },
  // Scottish Fold (7)
  { breedId: 7, diseaseId: 7, prevalenceRate: 1.00, severity: 'HIGH' },
  { breedId: 7, diseaseId: 1, prevalenceRate: 0.15, severity: 'MEDIUM' },
  // Sphynx (8)
  { breedId: 8, diseaseId: 1, prevalenceRate: 0.35, severity: 'HIGH' },
  // Abyssinian (9)
  { breedId: 9, diseaseId: 3, prevalenceRate: 0.25, severity: 'HIGH' },
  { breedId: 9, diseaseId: 5, prevalenceRate: 0.30, severity: 'HIGH' },
  // Norwegian Forest Cat (10)
  { breedId: 10, diseaseId: 1, prevalenceRate: 0.20, severity: 'MEDIUM' },
  // Burmese (12)
  { breedId: 12, diseaseId: 1, prevalenceRate: 0.12, severity: 'MEDIUM' },
  // Turkish Van (15)
  { breedId: 15, diseaseId: 1, prevalenceRate: 0.15, severity: 'MEDIUM' },
]
