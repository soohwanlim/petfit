import { useState, useEffect } from 'react'
import { getBreeds } from '../services/staticApi'

export function useBreeds() {
  const [breeds, setBreeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getBreeds()
      .then(r => setBreeds(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { breeds, loading, error }
}
