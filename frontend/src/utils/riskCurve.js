const SIGMA = 2.0
const MAX_AGE = 14

function logistic(x) {
  return 1 / (1 + Math.exp(-x))
}

function cumulativeRisk(age, typicalOnsetAge, prevalenceRate) {
  const normalizer = logistic((MAX_AGE - typicalOnsetAge) / SIGMA)
  const raw = logistic((age - typicalOnsetAge) / SIGMA)
  return Math.min((raw / normalizer) * prevalenceRate, prevalenceRate)
}

export function buildRiskCurve(typicalOnsetAge, prevalenceRate) {
  return Array.from({ length: MAX_AGE * 2 + 1 }, (_, i) => {
    const age = i * 0.5
    return {
      age,
      risk: parseFloat((cumulativeRisk(age, typicalOnsetAge, prevalenceRate) * 100).toFixed(2)),
    }
  })
}

export function riskAtAge(age, typicalOnsetAge, prevalenceRate) {
  return cumulativeRisk(age, typicalOnsetAge, prevalenceRate) * 100
}
