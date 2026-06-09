import { useState } from 'react'

function getUsers() {
  const raw = import.meta.env.VITE_USERS || ''
  return raw.split(',').map(u => {
    const [nick, haslo, typ, rola] = u.trim().split(':')
    return { nick, haslo, typ: typ || 'member', rola: rola || '' }
  }).filter(u => u.nick && u.haslo)
}

export default function Login({ onLogin }) {
  const [nick, setNick] = useState('')
  const [haslo, setHaslo] = useState('')
  const [blad, setBlad] = useState('')

  function submit() {
    if (!nick.trim() || !haslo.trim()) return setBlad('Wpisz nick i hasło.')
    const users = getUsers()
    const user = users.find(u => u.nick.toLowerCase() === nick.trim().toLowerCase() && u.haslo === haslo)
    if (!user) return setBlad('Zły nick lub hasło. Napisz do admina na DC.')
    onLogin({ nick: user.nick, rola: user.rola, isAdmin: user.typ === 'admin' })
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#08080f',
    }}>
      <div style={{
        background: '#111120', border: '1px solid #2d2d4e',
        borderRadius: 20, padding: 32, width: 320,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎭</div>
          <h1 style={{
            fontSize: 22, fontWeight: 700,
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Night Studio</h1>
          <p style={{ fontSize: 12, color: '#4b5563', marginTop: 6 }}>
            Nie masz dostępu? Napisz do admina na DC.
          </p>
        </div>

        <input
          value={nick} onChange={e => setNick(e.target.value)}
          placeholder="Nick" autoFocus
          style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 10, padding: '11px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none' }}
        />
        <input
          value={haslo} onChange={e => setHaslo(e.target.value)}
          placeholder="Hasło" type="password"
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 10, padding: '11px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none' }}
        />

        {blad && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{blad}</p>}

        <button onClick={submit} style={{
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          border: 'none', borderRadius: 10, padding: '12px',
          color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Zaloguj się</button>
      </div>
    </div>
  )
}
