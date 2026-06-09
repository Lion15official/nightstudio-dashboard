import { useState } from 'react'
import Nav from './components/Nav'
import Projekty from './pages/Projekty'
import Ekipa from './pages/Ekipa'
import Ogloszenia from './pages/Ogloszenia'
import Login from './pages/Login'
import './index.css'

export default function App() {
  const [page, setPage] = useState('projekty')
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('ns_user')
    return saved ? JSON.parse(saved) : null
  })

  function handleLogin(u) {
    sessionStorage.setItem('ns_user', JSON.stringify(u))
    setUser(u)
  }

  function handleLogout() {
    sessionStorage.removeItem('ns_user')
    setUser(null)
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <>
      <Nav page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <main style={{ flex: 1, padding: '24px 28px' }}>
        {page === 'projekty' && <Projekty user={user} />}
        {page === 'ekipa' && <Ekipa user={user} />}
        {page === 'ogloszenia' && <Ogloszenia user={user} />}
      </main>
    </>
  )
}
