import ScoreBadge from './ScoreBadge'

export default function RecommendationCard({ recommendation }) {
  const {
    productName, provider, monthlyPremium, score,
    breakdown, matchedRiders, illnessRiders, waitingWarnings, url,
  } = recommendation

  const illnessOnlyRiders = (illnessRiders ?? []).filter(r => !(matchedRiders ?? []).includes(r))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{productName}</h3>
          <p className="text-sm text-gray-500">{provider}</p>
        </div>
        <ScoreBadge score={score} />
      </div>

      {/* Premium */}
      <div className="mt-3 text-sm text-gray-700">
        <span className="font-medium">{monthlyPremium?.toLocaleString('ko-KR')}원</span>
        <span className="text-gray-400">/월</span>
      </div>

      {/* Score breakdown */}
      {breakdown && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { label: '특약적합도', value: breakdown.riderFit },
            { label: '보장비율',   value: breakdown.coverage },
            { label: '면책기간',   value: breakdown.waiting },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-md p-2">
              <div className="text-xs text-gray-500 mb-0.5">{label}</div>
              {value != null ? (
                <div className={`text-sm font-bold ${
                  value >= 70 ? 'text-green-600' : value >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {value}
                </div>
              ) : (
                <div className="text-sm text-gray-400">—</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recommended riders */}
      {((matchedRiders?.length ?? 0) > 0 || illnessOnlyRiders.length > 0) && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1.5">추천 특약</p>
          <div className="flex flex-wrap gap-1.5">
            {(matchedRiders ?? []).map(rider => (
              <span key={rider} className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded">
                {rider}
              </span>
            ))}
            {illnessOnlyRiders.map(rider => (
              <span key={rider} className="inline-block bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded">
                {rider} <span className="opacity-70">(병력)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Waiting period warnings */}
      {(waitingWarnings?.length ?? 0) > 0 && (
        <div className="mt-3 space-y-1">
          {waitingWarnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-600 flex items-start gap-1">
              <span className="mt-px">⚠</span>
              <span>{w}</span>
            </p>
          ))}
        </div>
      )}

      {/* Insurer link */}
      {url && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            {provider} 가입 페이지 →
          </a>
        </div>
      )}
    </div>
  )
}
