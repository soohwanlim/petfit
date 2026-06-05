import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer, Label,
} from 'recharts'
import { buildRiskCurve, riskAtAge } from '../utils/riskCurve'

const WAITING_ZONES = [
  { months: 1,  x2Months: 1,  bg: 'bg-green-50',  text: 'text-green-700',  label: '면책 1개월' },
  { months: 3,  x2Months: 3,  bg: 'bg-yellow-50', text: 'text-yellow-700', label: '면책 3개월' },
  { months: 6,  x2Months: 6,  bg: 'bg-orange-50', text: 'text-orange-700', label: '면책 6개월' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-gray-700 mb-0.5">{label}세</p>
      <p className="text-indigo-600">누적 발병률 {payload[0].value.toFixed(1)}%</p>
    </div>
  )
}

export default function DiseaseRiskChart({ disease, prevalenceRate, catAge }) {
  const { typicalOnsetAge, koreanName, name } = disease

  if (!typicalOnsetAge) {
    return (
      <p className="text-xs text-gray-400 py-4 text-center">이 질환은 발병 연령 데이터가 없습니다.</p>
    )
  }

  const data = buildRiskCurve(typicalOnsetAge, prevalenceRate)
  const yMax = Math.max(Math.ceil(prevalenceRate * 100 * 1.3), 5)

  const riskNow = catAge != null ? riskAtAge(catAge, typicalOnsetAge, prevalenceRate) : null

  const zones = catAge != null && catAge <= 14
    ? WAITING_ZONES.map(z => ({
        ...z,
        x1: catAge,
        x2: Math.min(catAge + z.x2Months / 12, 14),
        delta: riskAtAge(catAge + z.x2Months / 12, typicalOnsetAge, prevalenceRate) - riskNow,
      }))
    : []

  return (
    <div>
      <p className="text-sm font-medium text-gray-800 mb-3">
        {koreanName || name}
        <span className="ml-2 text-xs text-gray-400 font-normal">
          전형 발병 {typicalOnsetAge}세 · 품종 내 유병률 {(prevalenceRate * 100).toFixed(0)}%
        </span>
      </p>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="age"
            ticks={[0, 2, 4, 6, 8, 10, 12, 14]}
            tickFormatter={v => `${v}세`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />

          {zones.map(z => (
            <ReferenceArea
              key={z.label}
              x1={z.x1}
              x2={z.x2}
              fill={
                z.months === 1 ? '#bbf7d0' :
                z.months === 3 ? '#fef08a' : '#fed7aa'
              }
              fillOpacity={0.55}
            />
          ))}

          {catAge != null && catAge >= 0 && catAge <= 14 && (
            <ReferenceLine x={catAge} stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2">
              <Label value="현재 나이" position="insideTopRight" fontSize={10} fill="#6366f1" offset={4} />
            </ReferenceLine>
          )}

          <Area
            type="monotone"
            dataKey="risk"
            stroke="#6366f1"
            fill="#e0e7ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {zones.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          {zones.map(z => (
            <div key={z.label} className={`${z.bg} rounded-md p-2`}>
              <div className="text-gray-500 mb-0.5">{z.label}</div>
              <div className={`font-semibold ${z.text}`}>
                +{z.delta.toFixed(1)}%p
              </div>
              <div className="text-gray-400 text-[10px]">면책기간 내 추가 위험</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
