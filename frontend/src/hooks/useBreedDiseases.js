import { useState, useEffect } from 'react'
import { getBreedDiseases } from '../services/api'

export function useBreedDiseases(breedId) {
  const [breedDiseases, setBreedDiseases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!breedId) {
      setBreedDiseases([])
      return
    }
    setLoading(true)
    setError(null)
    getBreedDiseases(breedId)
      .then(r => setBreedDiseases(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [breedId])

  return { breedDiseases, loading, error }
}
