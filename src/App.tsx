import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import { Login } from './components/Login'
import { RouteChangeEffects } from './components/RouteChangeEffects'
import { Home } from './pages/Home'
import { ItemDetail } from './pages/ItemDetail'

function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7] dark:bg-[#161614]">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Laden...</p>
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <HashRouter>
      <RouteChangeEffects />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
