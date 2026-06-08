import RecommendationCard from './RecommendationCard'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-toss-line p-5 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-3 w-14 bg-toss-line rounded mb-2" />
          <div className="h-5 w-40 bg-toss-line rounded" />
        </div>
        <div className="h-8 w-12 bg-toss-line rounded" />
      </div>
      <div className="h-6 w-24 bg-toss-line rounded mt-3" />
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-toss-line rounded-lg" />)}
      </div>
    </div>
  )
}

export default function RecommendationList({ recommendations, loading, error }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-toss-red">{error}</p>
      </div>
    )
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
