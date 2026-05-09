import RecommendationCard from './RecommendationCard'

export default function RecommendationList({ recommendations, loading, error }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-red-600 text-sm">{error}</p>
  }

  if (recommendations.length === 0) return null

  return (
    <div className="space-y-3">
      {recommendations.map(r => (
        <RecommendationCard key={r.id} recommendation={r} />
      ))}
    </div>
  )
}
