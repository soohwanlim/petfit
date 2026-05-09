import { useBreeds } from '../hooks/useBreeds'

export default function BreedSelector({ onSelect }) {
  const { breeds, loading } = useBreeds()

  return (
    <div>
      <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
        Select your cat's breed
      </label>
      <select
        id="breed"
        disabled={loading}
        defaultValue=""
        onChange={e => onSelect(e.target.value || null)}
        className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
      >
        <option value="">{loading ? 'Loading breeds…' : 'Choose a breed…'}</option>
        {breeds.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    </div>
  )
}
