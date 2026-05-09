import HomePage from './pages/HomePage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-indigo-600">PetFit</h1>
          <p className="text-sm text-gray-500">Cat insurance recommendations by breed</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <HomePage />
      </main>
    </div>
  )
}

export default App
