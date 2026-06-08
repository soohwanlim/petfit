import { useState } from 'react'
import BreedSelector from '../components/BreedSelector'
import RecommendationList from '../components/RecommendationList'
import DiseaseRiskChart from '../components/DiseaseRiskChart'
import { useRecommendations } from '../hooks/useRecommendations'
import { useBreedDiseases } from '../hooks/useBreedDiseases'

const AGE_OPTIONS = [
  { label: '1세 미만', value: 0.5 },
  { label: '1세', value: 1 },
  { label: '2세', value: 2 },
  { label: '3세', value: 3 },
  { label: '4세', value: 4 },
  { label: '5세', value: 5 },
  { label: '6세', value: 6 },
  { label: '7세', value: 7 },
  { label: '8세', value: 8 },
  { label: '9세', value: 9 },
  { label: '10세+', value: 12 },
]

const ILLNESS_OPTIONS = [
  '비뇨기', '심장/순환기', '관절/골격', '피부/외이도',
  '치과/구강', '호흡기', '소화기', '눈/안과',
]

export default function HomePage() {
  const [breedId, setBreedId] = useState(null)
  const [catAge, setCatAge] = useState(null)
  const [illnesses, setIllnesses] = useState([])
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(null)

  const { recommendations, loading, error } = useRecommendations(breedId, catAge, illnesses)
  const { breedDiseases } = useBreedDiseases(breedId)

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
    <div>
      {/* STEP 1 — 품종 */}
      <section className="bg-white px-5 py-6">
        <p className="text-[11px] font-semibold text-toss-gray2 tracking-widest mb-2">STEP 1</p>
        <h2 className="text-base font-bold text-toss-black mb-4">고양이 품종을 선택해주세요</h2>
        <BreedSelector onSelect={handleBreedSelect} />
      </section>

      <div className="h-2 bg-toss-bg" />

      {/* STEP 2 — 나이 */}
      <section className="bg-white px-5 py-6">
        <p className="text-[11px] font-semibold text-toss-gray2 tracking-widest mb-2">STEP 2</p>
        <h2 className="text-base font-bold text-toss-black mb-4">고양이 나이를 알려주세요</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-5 px-5">
          {AGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCatAge(prev => prev === opt.value ? null : opt.value)}
              className={`flex-none px-4 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                catAge === opt.value
                  ? 'bg-toss-blue text-white'
                  : 'bg-toss-bg text-toss-gray1'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <div className="h-2 bg-toss-bg" />

      {/* STEP 3 — 병력 */}
      <section className="bg-white px-5 py-6">
        <p className="text-[11px] font-semibold text-toss-gray2 tracking-widest mb-2">STEP 3</p>
        <h2 className="text-base font-bold text-toss-black">아팠던 부위가 있나요?</h2>
        <p className="text-sm text-toss-gray1 mt-1 mb-4">해당되는 곳을 모두 선택해주세요</p>
        <div className="flex flex-wrap gap-2">
          {ILLNESS_OPTIONS.map(illness => (
            <button
              key={illness}
              type="button"
              onClick={() => toggleIllness(illness)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                illnesses.includes(illness)
                  ? 'bg-toss-blue-light text-toss-blue'
                  : 'bg-toss-bg text-toss-gray1'
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
            className="mt-3 text-xs text-toss-gray2 underline underline-offset-2"
          >
            선택 초기화
          </button>
        )}
      </section>

      {/* 발병률 분석 */}
      {breedDiseases.length > 0 && (
        <>
          <div className="h-2 bg-toss-bg" />
          <section className="bg-white px-5 py-6">
            <h2 className="text-base font-bold text-toss-black">품종 발병률 분석</h2>
            <p className="text-sm text-toss-gray1 mt-1 mb-4">질환을 선택하면 연령별 누적 발병률을 볼 수 있어요</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {breedDiseases.map(({ diseaseId, koreanName, severity, prevalenceRate }) => (
                <button
                  key={diseaseId}
                  type="button"
                  onClick={() => setSelectedDiseaseId(prev => prev === diseaseId ? null : diseaseId)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedDiseaseId === diseaseId
                      ? 'bg-toss-blue text-white'
                      : 'bg-toss-bg text-toss-gray1'
                  }`}
                >
                  {koreanName}
                  <span className={`text-xs font-bold ${
                    selectedDiseaseId === diseaseId ? 'text-white/70' :
                    severity === 'HIGH'   ? 'text-toss-red' :
                    severity === 'MEDIUM' ? 'text-toss-orange' : 'text-toss-gray2'
                  }`}>
                    {(prevalenceRate * 100).toFixed(0)}%
                  </span>
                </button>
              ))}
            </div>
            {selectedStat && (
              <DiseaseRiskChart
                disease={selectedStat}
                prevalenceRate={selectedStat.prevalenceRate}
                catAge={catAge}
              />
            )}
          </section>
        </>
      )}

      {/* 추천 결과 */}
      <div className="h-2 bg-toss-bg" />
      <section className="bg-white px-5 py-6 pb-16">
        {!breedId ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🐾</div>
            <p className="text-base font-bold text-toss-black">품종을 선택해주세요</p>
            <p className="text-sm text-toss-gray1 mt-1.5">맞춤형 보험 플랜을 추천해드릴게요</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-toss-black">추천 보험 플랜</h2>
              {!loading && recommendations.length > 0 && (
                <span className="text-sm text-toss-gray1">{recommendations.length}개</span>
              )}
            </div>
            <RecommendationList recommendations={recommendations} loading={loading} error={error} />
          </>
        )}
      </section>
    </div>
  )
}
