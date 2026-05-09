import ScoreBadge from './ScoreBadge'

export default function RecommendationCard({ recommendation }) {
  const { productName, provider, monthlyPremium, score, matchedRiders } = recommendation

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{productName}</h3>
          <p className="text-sm text-gray-500">{provider}</p>
        </div>
        <ScoreBadge score={score} />
      </div>

      <div className="mt-3 text-sm text-gray-700">
        <span className="font-medium">${monthlyPremium?.toFixed(2)}</span>
        <span className="text-gray-400"> / month</span>
      </div>

      {matchedRiders.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {matchedRiders.map(rider => (
            <span
              key={rider}
              className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded"
            >
              {rider}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-gray-400 italic">
          No riders match your breed's risk profile
        </p>
      )}
    </div>
  )
}
