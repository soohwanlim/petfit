import { useState, useEffect } from 'react'
import { getRecommendations } from '../services/api'

export function useRecommendations(breedId) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!breedId) {
      setRecommendations([])
      return
    }
    setLoading(true)
    setError(null)
    getRecommendations(breedId)
      .then(r => setRecommendations(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [breedId])

  return { recommendations, loading, error }
}
