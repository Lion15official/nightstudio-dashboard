const links = [
  { id: 'projekty', label: '🎬 Projekty' },
  { id: 'ekipa', label: '👥 Ekipa' },
  { id: 'ogloszenia', label: '📢 Ogłoszenia' },
]

export default function Nav({ page, setPage, user, onLogout }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '14px 28px', borderBottom: '1px solid #1a1a2e',
      background: '#0a0a14',
    }}>
      <span style={{
        fontWeight: 700, fontSize: 18,
        background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        🎭 Night Studio
      </span>
      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
        {links.map(l => (
          <button key={l.id} onClick={() => setPage(l.id)} style={{
            background: page === l.id ? '#1e1e3a' : 'none',
            border: page === l.id ? '1px solid #3d3d6e' : '1px solid transparent',
            borderRadius: 8, padding: '6px 14px',
            color: page === l.id ? '#c4b5fd' : '#6b7280',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            transition: 'all 0.15s',
          }}>
            {l.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          👤 <span style={{ color: '#c4b5fd' }}>{user.nick}</span>
          {user.rola && user.rola.split('/').map((r, i) => (
            <span key={i} style={{ background: '#1e1e3a', border: '1px solid #3d3d6e', borderRadius: 5, padding: '1px 7px', fontSize: 11, color: '#a78bfa' }}>{r.trim()}</span>
          ))}
          {user.isAdmin && <span style={{ color: '#f59e0b' }}>★ Admin</span>}
        </span>
        <button onClick={onLogout} style={{
          background: 'none', border: '1px solid #2d2d4e', borderRadius: 8,
          padding: '5px 12px', color: '#6b7280', cursor: 'pointer', fontSize: 12,
        }}>Wyloguj</button>
      </div>
    </nav>
  )
}
