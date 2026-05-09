import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

export const getBreeds = () => axios.get(`${BASE}/breeds`)
export const getRecommendations = (breedId) =>
  axios.get(`${BASE}/recommendations`, { params: { breedId } })
