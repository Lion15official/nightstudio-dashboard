import { useState } from 'react'

function load() { return JSON.parse(localStorage.getItem('ns_ekipa') || '[]') }
function save(d) { localStorage.setItem('ns_ekipa', JSON.stringify(d)) }

export default function Ekipa({ user }) {
  const isAdmin = user?.isAdmin
  const [ekipa, setEkipa] = useState(load)
  const [modal, setModal] = useState(false)
  const [nick, setNick] = useState('')
  const [role, setRole] = useState([''])

  function dodajPole() { setRole([...role, '']) }
  function zmienRole(i, val) { setRole(role.map((r, idx) => idx === i ? val : r)) }
  function usunPole(i) { setRole(role.filter((_, idx) => idx !== i)) }

  function dodaj() {
    if (!nick.trim()) return
    const roleFiltered = role.filter(r => r.trim())
    const nowe = [...ekipa, { id: Date.now(), nick, rola: roleFiltered.join(' / ') }]
    save(nowe)
    setEkipa(nowe)
    setNick('')
    setRole([''])
    setModal(false)
  }

  function usun(id) {
    const updated = ekipa.filter(e => e.id !== id)
    save(updated)
    setEkipa(updated)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0f0' }}>Ekipa</h1>
        {isAdmin && (
          <button onClick={() => setModal(true)} style={{
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: 'none', borderRadius: 10, padding: '9px 18px',
            color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>+ Dodaj osobę</button>
        )}
      </div>

      {ekipa.length === 0 && (
        <p style={{ color: '#4b5563', textAlign: 'center', marginTop: 60, fontSize: 14 }}>Brak członków ekipy.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ekipa.map(e => (
          <div key={e.id} style={{
            background: '#111120', border: '1px solid #1e1e3a',
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 15, flexShrink: 0,
            }}>
              {e.nick[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#e2d9ff' }}>{e.nick}</div>
              {e.rola && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {e.rola.split(' / ').map((r, i) => (
                    <span key={i} style={{
                      background: '#1e1e3a', border: '1px solid #3d3d6e',
                      borderRadius: 6, padding: '2px 8px',
                      fontSize: 11, color: '#a78bfa',
                    }}>{r}</span>
                  ))}
                </div>
              )}
            </div>
            {isAdmin && (
              <button onClick={() => usun(e.id)} style={{
                background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 18,
              }}>×</button>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000aa', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111120', border: '1px solid #2d2d4e', borderRadius: 16, padding: 24, width: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Nowa osoba</h2>
            <input value={nick} onChange={e => setNick(e.target.value)} placeholder="Nick" autoFocus
              onKeyDown={e => e.key === 'Enter' && dodaj()}
              style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 10, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Role</span>
              {role.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input value={r} onChange={e => zmienRole(i, e.target.value)} placeholder={`Rola ${i + 1} (np. Kinger)`}
                    style={{ flex: 1, background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 10, padding: '8px 12px', color: '#f0f0f0', fontSize: 13, outline: 'none' }} />
                  {role.length > 1 && (
                    <button onClick={() => usunPole(i)} style={{ background: 'none', border: '1px solid #2d2d4e', borderRadius: 8, padding: '0 10px', color: '#6b7280', cursor: 'pointer' }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={dodajPole} style={{ background: 'none', border: '1px dashed #3d3d6e', borderRadius: 8, padding: '7px', color: '#6b7280', cursor: 'pointer', fontSize: 12 }}>
                + Dodaj kolejną rolę
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setModal(false); setRole(['']) }} style={{ background: 'none', border: '1px solid #2d2d4e', borderRadius: 8, padding: '8px 16px', color: '#6b7280', cursor: 'pointer' }}>Anuluj</button>
              <button onClick={dodaj} style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Dodaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
