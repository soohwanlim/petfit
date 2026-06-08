export default function ScoreBadge({ score }) {
  const rounded = Math.round(score)
  const [color, label] =
    score >= 70 ? ['text-toss-blue', '적합']
    : score >= 40 ? ['text-toss-orange', '보통']
    : ['text-toss-gray1', '낮음']

  return (
    <div className="text-right shrink-0">
      <div className={`text-2xl font-bold leading-none ${color}`}>
        {rounded}<span className="text-sm font-semibold">점</span>
      </div>
      <div className={`text-xs font-medium mt-0.5 ${color}`}>{label}</div>
    </div>
  )
}
