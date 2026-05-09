import { useState } from 'react'
import BreedSelector from '../components/BreedSelector'
import RecommendationList from '../components/RecommendationList'
import { useRecommendations } from '../hooks/useRecommendations'

export default function HomePage() {
  const [breedId, setBreedId] = useState(null)
  const { recommendations, loading, error } = useRecommendations(breedId)

  return (
    <div className="space-y-6">
      <BreedSelector onSelect={setBreedId} />

      {breedId ? (
        <div>
          <p className="text-sm text-gray-500 mb-3">
            {loading
              ? 'Finding best matches…'
              : `${recommendations.length} plans ranked for your cat`}
          </p>
          <RecommendationList
            recommendations={recommendations}
            loading={loading}
            error={error}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Select a breed above to see personalised insurance recommendations</p>
        </div>
      )}
    </div>
  )
}
