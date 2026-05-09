import { useState, useEffect } from 'react'
import { getRecommendations } from '../services/staticApi'

export function useRecommendations(breedId, catAge, illnesses) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const illnessKey = illnesses?.join(',') ?? ''

  useEffect(() => {
    if (!breedId) {
      setRecommendations([])
      return
    }
    setLoading(true)
    setError(null)
    getRecommendations(breedId, catAge, illnesses ?? [])
      .then(r => setRecommendations(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [breedId, catAge, illnessKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { recommendations, loading, error }
}
