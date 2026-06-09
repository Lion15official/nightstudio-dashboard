import { useState } from 'react'

function load() { return JSON.parse(localStorage.getItem('ns_ogloszenia') || '[]') }
function save(d) { localStorage.setItem('ns_ogloszenia', JSON.stringify(d)) }

export default function Ogloszenia({ user }) {
  const isAdmin = user?.isAdmin
  const [lista, setLista] = useState(load)
  const [tekst, setTekst] = useState('')

  function dodaj() {
    if (!tekst.trim()) return
    const nowe = [{ id: Date.now(), tekst, data: new Date().toLocaleDateString('pl') }, ...lista]
    save(nowe)
    setLista(nowe)
    setTekst('')
  }

  function usun(id) {
    const updated = lista.filter(o => o.id !== id)
    save(updated)
    setLista(updated)
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0f0', marginBottom: 20 }}>Ogłoszenia</h1>

      {isAdmin && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <input
            value={tekst}
            onChange={e => setTekst(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && dodaj()}
            placeholder="Napisz ogłoszenie dla ekipy..."
            style={{
              flex: 1, background: '#111120', border: '1px solid #2d2d4e',
              borderRadius: 10, padding: '10px 14px', color: '#f0f0f0',
              fontSize: 14, outline: 'none',
            }}
          />
          <button onClick={dodaj} style={{
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: 'none', borderRadius: 10, padding: '10px 18px',
            color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13,
          }}>Dodaj</button>
        </div>
      )}

      {lista.length === 0 && (
        <p style={{ color: '#4b5563', textAlign: 'center', marginTop: 60, fontSize: 14 }}>Brak ogłoszeń.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lista.map(o => (
          <div key={o.id} style={{
            background: '#111120', border: '1px solid #1e1e3a',
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
          }}>
            <div>
              <p style={{ fontSize: 14, color: '#e2d9ff', lineHeight: 1.5 }}>{o.tekst}</p>
              <span style={{ fontSize: 11, color: '#4b5563', marginTop: 6, display: 'block' }}>{o.data}</span>
            </div>
            {isAdmin && (
              <button onClick={() => usun(o.id)} style={{
                background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 18, flexShrink: 0,
              }}>×</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
