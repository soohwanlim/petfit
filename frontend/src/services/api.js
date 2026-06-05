import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

export const getBreeds = () => axios.get(`${BASE}/breeds`)

export const getRecommendations = (breedId, catAge, illnesses = []) => {
  const params = new URLSearchParams()
  params.set('breedId', breedId)
  if (catAge != null) params.set('catAge', catAge)
  illnesses.forEach(i => params.append('illnesses', i))
  return axios.get(`${BASE}/recommendations?${params.toString()}`)
}
