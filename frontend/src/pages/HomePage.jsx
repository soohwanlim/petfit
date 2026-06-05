import { useState } from 'react'
import BreedSelector from '../components/BreedSelector'
import RecommendationList from '../components/RecommendationList'
import DiseaseRiskChart from '../components/DiseaseRiskChart'
import { useRecommendations } from '../hooks/useRecommendations'
import { diseases, breedDiseaseStats } from '../data/diseases'

const ILLNESS_OPTIONS = [
  '비뇨기', '심장/순환기', '관절/골격', '피부/외이도',
  '치과/구강', '호흡기', '소화기', '눈/안과',
]

const AGE_OPTIONS = Array.from({ length: 31 }, (_, i) => i * 0.5)

export default function HomePage() {
  const [breedId, setBreedId] = useState(null)
  const [catAge, setCatAge] = useState(null)
  const [illnesses, setIllnesses] = useState([])
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(null)

  const { recommendations, loading, error } = useRecommendations(breedId, catAge, illnesses)

  const breedStats = breedId
    ? breedDiseaseStats.filter(s => s.breedId === Number(breedId))
    : []

  const breedDiseases = breedStats
    .map(s => {
      const d = diseases.find(d => d.id === s.diseaseId)
      return d ? { ...s, disease: d } : null
    })
    .filter(Boolean)

  const selectedStat = breedDiseases.find(s => s.diseaseId === selectedDiseaseId)

  function handleBreedSelect(id) {
    setBreedId(id)
    setSelectedDiseaseId(null)
  }

  function toggleIllness(illness) {
    setIllnesses(prev =>
      prev.includes(illness) ? prev.filter(i => i !== illness) : [...prev, illness]
    )
  }

  return (
    <div className="space-y-6">
      <BreedSelector onSelect={handleBreedSelect} />

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

      {/* Disease risk chart section */}
      {breedDiseases.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            발병률 분석{' '}
            <span className="text-gray-400 font-normal text-xs">
              질환을 선택하면 연령별 누적 발병률 + 면책기간 오버레이를 볼 수 있어요
            </span>
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {breedDiseases.map(({ diseaseId, disease, severity, prevalenceRate }) => (
              <button
                key={diseaseId}
                type="button"
                onClick={() => setSelectedDiseaseId(prev => prev === diseaseId ? null : diseaseId)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedDiseaseId === diseaseId
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'
                }`}
              >
                {disease.koreanName}
                <span className={`ml-1.5 ${
                  severity === 'HIGH'   ? 'text-red-400' :
                  severity === 'MEDIUM' ? 'text-yellow-500' : 'text-gray-400'
                }`}>
                  {(prevalenceRate * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>

          {selectedStat && (
            <DiseaseRiskChart
              disease={selectedStat.disease}
              prevalenceRate={selectedStat.prevalenceRate}
              catAge={catAge}
            />
          )}
        </div>
      )}

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
