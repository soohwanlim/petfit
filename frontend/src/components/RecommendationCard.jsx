import ScoreBadge from './ScoreBadge'

export default function RecommendationCard({ recommendation }) {
  const {
    productName, provider, monthlyPremium, score,
    breakdown, matchedRiders, illnessRiders, waitingWarnings, url,
  } = recommendation

  const illnessOnlyRiders = (illnessRiders ?? []).filter(r => !(matchedRiders ?? []).includes(r))

  return (
    <div className="bg-white rounded-2xl border border-toss-line overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-toss-gray1 mb-0.5">{provider}</p>
            <h3 className="text-[15px] font-bold text-toss-black leading-snug">{productName}</h3>
          </div>
          <ScoreBadge score={score} />
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-xl font-bold text-toss-black">
            {monthlyPremium?.toLocaleString('ko-KR')}
          </span>
          <span className="text-sm text-toss-gray1">원/월</span>
        </div>
      </div>

      {/* 점수 세부 */}
      {breakdown && (
        <div className="border-t border-toss-line px-5 py-4 grid grid-cols-3 gap-3 text-center">
          {[
            { label: '특약 적합도', value: breakdown.riderFit },
            { label: '보장 비율',   value: breakdown.coverage },
            { label: '면책 기간',   value: breakdown.waiting },
          ].map(({ label, value }) => {
            const color =
              value == null ? 'text-toss-gray2'
              : value >= 70 ? 'text-toss-blue'
              : value >= 40 ? 'text-toss-orange'
              : 'text-toss-red'
            const barColor =
              value == null ? 'bg-toss-line'
              : value >= 70 ? 'bg-toss-blue'
              : value >= 40 ? 'bg-toss-orange'
              : 'bg-toss-red'
            return (
              <div key={label}>
                <p className="text-xs text-toss-gray1 mb-1">{label}</p>
                <p className={`text-sm font-bold ${color}`}>
                  {value != null ? value : '—'}
                </p>
                <div className="mt-1.5 h-1 bg-toss-line rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: value != null ? `${Math.min(value, 100)}%` : '0%' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 추천 특약 */}
      {((matchedRiders?.length ?? 0) > 0 || illnessOnlyRiders.length > 0) && (
        <div className="border-t border-toss-line px-5 py-4">
          <p className="text-xs font-semibold text-toss-gray1 mb-2">추천 특약</p>
          <div className="flex flex-wrap gap-1.5">
            {(matchedRiders ?? []).map(rider => (
              <span key={rider} className="bg-toss-blue-light text-toss-blue text-xs font-medium px-2.5 py-1 rounded-full">
                {rider}
              </span>
            ))}
            {illnessOnlyRiders.map(rider => (
              <span key={rider} className="bg-orange-50 text-toss-orange text-xs font-medium px-2.5 py-1 rounded-full">
                {rider} · 병력
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 면책기간 경고 */}
      {(waitingWarnings?.length ?? 0) > 0 && (
        <div className="border-t border-toss-line px-5 py-3 space-y-1.5">
          {waitingWarnings.map((w, i) => (
            <p key={i} className="text-xs text-toss-orange flex items-start gap-1.5">
              <span>⚠️</span>
              <span>{w}</span>
            </p>
          ))}
        </div>
      )}

      {/* 가입 링크 */}
      {url && (
        <div className="border-t border-toss-line px-5 py-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-toss-blue-light text-toss-blue text-sm font-semibold rounded-xl"
          >
            {provider} 가입 페이지 보기
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}
