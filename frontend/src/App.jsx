import HomePage from './pages/HomePage'

export default function App() {
  return (
    <div className="min-h-screen bg-toss-bg font-sans">
      <div className="max-w-[430px] mx-auto">
        <header className="bg-white px-5 pt-12 pb-5">
          <h1 className="text-xl font-bold text-toss-black">🐱 PetFit</h1>
          <p className="text-sm text-toss-gray1 mt-1">품종별 고양이 보험 맞춤 추천</p>
        </header>
        <main>
          <HomePage />
        </main>
      </div>
    </div>
  )
}
