import { HashRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import { Login } from './components/Login'
import { Home } from './pages/Home'
import { ItemDetail } from './pages/ItemDetail'

function App() {
  const { session, loading } = useAuth()

  if (loading) return null
  if (!session) return <Login />

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<ItemDetail />} />
      </Routes>
    </HashRouter>
  )
}

export default App
