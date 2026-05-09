import { breeds } from '../data/breeds'
import { diseases, breedDiseaseStats } from '../data/diseases'
import { insuranceProducts } from '../data/insuranceProducts'

const SEVERITY_WEIGHT = { HIGH: 3, MEDIUM: 2, LOW: 1 }
const MATCH_NORMALIZER = 3.5

// Maps UI illness category labels to disease IDs for rider coverage lookup
const ILLNESS_TO_DISEASES = {
  '비뇨기':     [2],
  '심장/순환기': [1],
  '관절/골격':  [4, 7],
  '눈/안과':    [3],
  '피부/외이도': [],
  '치과/구강':  [],
  '호흡기':     [],
  '소화기':     [],
}

function scoreProduct(product, stats, catAge, illnesses) {
  // Coverage ratio → up to 20 pts
  const coverageScore = (product.coverageRatio ?? 0.65) * 20

  // Base medical coverage bonus → 10 pts
  const hasMedical = product.riders.some(r => r.coveredDiseases.length > 0)
  const baseScore = hasMedical ? 10 : 0

  // Breed disease-match score → up to 50 pts
  let rawMatch = 0
  const matchedRiderSet = new Set()
  for (const stat of stats) {
    for (const rider of product.riders) {
      if (rider.coveredDiseases.includes(stat.diseaseId)) {
        rawMatch += (SEVERITY_WEIGHT[stat.severity] ?? 1) * stat.prevalenceRate
        matchedRiderSet.add(rider.riderName)
      }
    }
  }
  const diseaseScore = Math.min((rawMatch / MATCH_NORMALIZER) * 50, 50)

  // Past illness coverage boost → up to 15 pts
  const illnessRiderSet = new Set()
  let illnessCoveredCount = 0
  for (const illness of illnesses) {
    const diseaseIds = ILLNESS_TO_DISEASES[illness] ?? []
    let covered = false
    for (const rider of product.riders) {
      const viaDiseaseId = diseaseIds.length > 0 && rider.coveredDiseases.some(id => diseaseIds.includes(id))
      const viaCategory = rider.illnessCategories?.includes(illness) ?? false
      if (viaDiseaseId || viaCategory) {
        illnessRiderSet.add(rider.riderName)
        covered = true
      }
    }
    if (covered) illnessCoveredCount++
  }
  const illnessBoost = illnesses.length > 0
    ? Math.min((illnessCoveredCount / illnesses.length) * 15, 15)
    : 0

  // Rider variety → up to 5 pts
  const varietyScore = Math.min((product.riders.length / 8) * 5, 5)

  // Waiting period penalty → up to -15 pts (skip if age unknown)
  let penaltyRaw = 0
  const waitingWarnings = []
  if (catAge != null) {
    const penalizedDiseases = new Set()
    for (const stat of stats) {
      if (stat.severity === 'LOW' || penalizedDiseases.has(stat.diseaseId)) continue
      const disease = diseases.find(d => d.id === stat.diseaseId)
      if (!disease?.typicalOnsetAge) continue

      const coveringRiders = product.riders.filter(r => r.coveredDiseases.includes(stat.diseaseId))
      if (coveringRiders.length === 0) continue

      const minWaiting = Math.min(...coveringRiders.map(r => r.waitingMonths ?? 1))
      const effectiveAge = catAge + minWaiting / 12

      if (effectiveAge > disease.typicalOnsetAge) {
        penaltyRaw += stat.severity === 'HIGH' ? 2 : 1
        penalizedDiseases.add(stat.diseaseId)
        waitingWarnings.push(
          `${disease.koreanName}: 면책기간(${minWaiting}개월) 후 보장 시작 시 전형 발병 연령(${disease.typicalOnsetAge}세) 초과 가능`
        )
      }
    }
  }
  const waitingPenalty = Math.min(penaltyRaw, 15)

  const score = Math.round(
    Math.max(
      Math.min(coverageScore + baseScore + diseaseScore + illnessBoost + varietyScore - waitingPenalty, 100),
      0
    )
  )

  const breakdown = {
    riderFit: Math.round(Math.min((diseaseScore + illnessBoost) / 65 * 100, 100)),
    coverage: Math.round((product.coverageRatio ?? 0.65) * 100),
    waiting: catAge != null
      ? Math.max(Math.round(100 - (waitingPenalty / 15) * 100), 0)
      : null,
  }

  return {
    score,
    breakdown,
    matchedRiders: Array.from(matchedRiderSet),
    illnessRiders: Array.from(illnessRiderSet),
    waitingWarnings,
  }
}

export function getBreeds() {
  return Promise.resolve({ data: breeds })
}

export function getRecommendations(breedId, catAge, illnesses = []) {
  const id = Number(breedId)
  const stats = breedDiseaseStats.filter(s => s.breedId === id)

  const recommendations = insuranceProducts
    .map(product => {
      const { score, breakdown, matchedRiders, illnessRiders, waitingWarnings } =
        scoreProduct(product, stats, catAge, illnesses)
      return {
        id: product.id,
        productName: product.productName,
        provider: product.provider,
        monthlyPremium: product.monthlyPremium,
        url: product.url,
        score,
        breakdown,
        matchedRiders,
        illnessRiders,
        waitingWarnings,
      }
    })
    .sort((a, b) => b.score - a.score)

  return Promise.resolve({ data: recommendations })
}
