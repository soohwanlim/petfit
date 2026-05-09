export default function ScoreBadge({ score }) {
  const rounded = Math.round(score)
  const color =
    score >= 70 ? 'bg-green-100 text-green-800'
    : score >= 40 ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${color}`}>
      {rounded}%
    </span>
  )
}
