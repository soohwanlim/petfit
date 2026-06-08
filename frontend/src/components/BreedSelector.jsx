import { useBreeds } from '../hooks/useBreeds'

export default function BreedSelector({ onSelect }) {
  const { breeds, loading } = useBreeds()

  return (
    <div className="relative">
      <select
        disabled={loading}
        defaultValue=""
        onChange={e => onSelect(e.target.value || null)}
        className="w-full bg-toss-bg text-toss-black rounded-xl px-4 py-4 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-toss-blue disabled:text-toss-gray2 cursor-pointer"
      >
        <option value="">{loading ? '품종 불러오는 중…' : '품종을 선택하세요'}</option>
        {breeds.map(b => (
          <option key={b.id} value={b.id}>
            {b.koreanName ? `${b.koreanName} (${b.name})` : b.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-toss-gray1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}
