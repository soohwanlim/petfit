import { useState } from 'react'
import BreedSelector from '../components/BreedSelector'
import RecommendationList from '../components/RecommendationList'
import { useRecommendations } from '../hooks/useRecommendations'

const ILLNESS_OPTIONS = [
  '비뇨기', '심장/순환기', '관절/골격', '피부/외이도',
  '치과/구강', '호흡기', '소화기', '눈/안과',
]

const AGE_OPTIONS = Array.from({ length: 31 }, (_, i) => i * 0.5)

export default function HomePage() {
  const [breedId, setBreedId] = useState(null)
  const [catAge, setCatAge] = useState(null)
  const [illnesses, setIllnesses] = useState([])

  const { recommendations, loading, error } = useRecommendations(breedId, catAge, illnesses)

  function toggleIllness(illness) {
    setIllnesses(prev =>
      prev.includes(illness) ? prev.filter(i => i !== illness) : [...prev, illness]
    )
  }

  return (
    <div className="space-y-6">
      <BreedSelector onSelect={setBreedId} />

      <div>
        <label htmlFor="catAge" className="block text-sm font-medium text-gray-700 mb-1">
          고양이 나이
        </label>
        <select
          id="catAge"
          defaultValue=""
          onChange={e => setCatAge(e.target.value !== '' ? Number(e.target.value) : null)}
          className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">나이를 선택하세요…</option>
          {AGE_OPTIONS.map(age => (
            <option key={age} value={age}>
              {age === 0 ? '0세 (갓 태어남)' : age === 0.5 ? '6개월' : `${age}세`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          아팠던 곳{' '}
          <span className="text-gray-400 font-normal">(해당되는 곳을 모두 선택)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {ILLNESS_OPTIONS.map(illness => (
            <button
              key={illness}
              type="button"
              onClick={() => toggleIllness(illness)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                illnesses.includes(illness)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {illness}
            </button>
          ))}
        </div>
        {illnesses.length > 0 && (
          <button
            type="button"
            onClick={() => setIllnesses([])}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            선택 초기화
          </button>
        )}
      </div>

      {breedId ? (
        <div>
          <p className="text-sm text-gray-500 mb-3">
            {loading
              ? '최적 플랜 탐색 중…'
              : `${recommendations.length}개 플랜이 추천되었습니다`}
          </p>
          <RecommendationList
            recommendations={recommendations}
            loading={loading}
            error={error}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">품종을 선택하면 맞춤형 보험 추천을 확인할 수 있어요</p>
        </div>
      )}
    </div>
  )
}
