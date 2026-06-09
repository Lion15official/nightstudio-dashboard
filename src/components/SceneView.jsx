import { useState } from 'react'
import { notify } from '../webhook'

const STATUSY = ['nie zaczęte', 'w trakcie', 'nagrane', 'zmontowane']
const STATUS_COLORS = {
  'nie zaczęte': '#6b7280',
  'w trakcie': '#f59e0b',
  'nagrane': '#22c55e',
  'zmontowane': '#a78bfa',
}

function loadSceny(pid) { return JSON.parse(localStorage.getItem(`ns_sceny_${pid}`) || '[]') }
function saveSceny(pid, d) { localStorage.setItem(`ns_sceny_${pid}`, JSON.stringify(d)) }
function loadEkipa() { return JSON.parse(localStorage.getItem('ns_ekipa') || '[]') }

export default function SceneView({ projekt, onBack, user }) {
  const isAdmin = user?.isAdmin
  const [sceny, setSceny] = useState(() => loadSceny(projekt.id))
  const [ekipa] = useState(loadEkipa)
  const [modal, setModal] = useState(false)
  const [nazwa, setNazwa] = useState('')
  const [osoba, setOsoba] = useState('')
  const [kim, setKim] = useState(isAdmin ? (localStorage.getItem('ns_kim') || '') : (user?.nick || ''))

  function zapisKim(nick) {
    setKim(nick)
    localStorage.setItem('ns_kim', nick)
  }

  function dodajScene() {
    if (!nazwa.trim()) return
    const nowe = [...sceny, { id: Date.now(), nazwa, osoba, status: 'nie zaczęte' }]
    saveSceny(projekt.id, nowe)
    setSceny(nowe)
    setNazwa('')
    setOsoba('')
    setModal(false)
  }

  function zmienStatus(id, nowy) {
    const updated = sceny.map(s => s.id === id ? { ...s, status: nowy } : s)
    saveSceny(projekt.id, updated)
    setSceny(updated)
  }

  function oddaj(id, plik) {
    const scena = sceny.find(s => s.id === id)
    const updated = sceny.map(s => s.id === id ? {
      ...s,
      status: 'nagrane',
      plik: plik ? plik.name : null,
    } : s)
    saveSceny(projekt.id, updated)
    setSceny(updated)
    notify.oddanie({ nick: kim || 'Ktoś', scena: scena?.nazwa, projekt: projekt.nazwa })
  }

  function usun(id) {
    const updated = sceny.filter(s => s.id !== id)
    saveSceny(projekt.id, updated)
    setSceny(updated)
  }

  const moje = kim ? sceny.filter(s => s.osoba === kim) : sceny
  const postep = sceny.length ? Math.round((sceny.filter(s => s.status === 'nagrane').length / sceny.length) * 100) : 0

  return (
    <div>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #2d2d4e', borderRadius: 8, padding: '7px 14px', color: '#a78bfa', cursor: 'pointer', fontSize: 13 }}>← Wróć</button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f0', flex: 1 }}>{projekt.nazwa}</h1>
        <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>{postep}%</span>
      </div>

      {/* pasek postępu */}
      <div style={{ height: 6, background: '#1e1e3a', borderRadius: 4, marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${postep}%`, background: 'linear-gradient(90deg, #7c3aed, #2563eb)', borderRadius: 4, transition: 'width 0.3s' }} />
      </div>

      {/* kim jesteś — tylko dla admina */}
      {isAdmin && (
        <div style={{ background: '#111120', border: '1px solid #1e1e3a', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#6b7280', flexShrink: 0 }}>Filtruj:</span>
          <select value={kim} onChange={e => zapisKim(e.target.value)}
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 8, padding: '6px 10px', color: '#f0f0f0', fontSize: 13, outline: 'none', flex: 1 }}>
            <option value=''>Wszystkie sceny</option>
            {ekipa.map(e => <option key={e.id} value={e.nick}>{e.nick} — {e.rola}</option>)}
          </select>
        </div>
      )}

      {/* toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {isAdmin
            ? (kim ? `Sceny: ${moje.length}` : `Wszystkie sceny (${sceny.length})`)
            : `Twoje sceny (${moje.length})`}
        </span>
        {isAdmin && (
          <button onClick={() => setModal(true)} style={{
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: 'none', borderRadius: 10, padding: '8px 16px',
            color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>+ Dodaj scenę</button>
        )}
      </div>

      {moje.length === 0 && (
        <p style={{ color: '#4b5563', textAlign: 'center', marginTop: 40, fontSize: 14 }}>
          {kim ? 'Nie masz przypisanych scen.' : 'Brak scen. Dodaj pierwszą!'}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {moje.map(s => (
          <div key={s.id} style={{
            background: '#111120', border: `1px solid ${STATUS_COLORS[s.status]}33`,
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#e2d9ff', marginBottom: 4 }}>{s.nazwa}</div>
                {s.osoba && <div style={{ fontSize: 12, color: '#6b7280' }}>👤 {s.osoba}</div>}
              </div>

              {isAdmin ? (
                <select value={s.status} onChange={e => zmienStatus(s.id, e.target.value)}
                  style={{
                    background: '#1a1a2e', border: `1px solid ${STATUS_COLORS[s.status]}55`,
                    borderRadius: 8, padding: '5px 8px',
                    color: STATUS_COLORS[s.status], fontSize: 12,
                    cursor: 'pointer', outline: 'none',
                  }}>
                  {STATUSY.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              ) : (
                <span style={{
                  background: '#1a1a2e', border: `1px solid ${STATUS_COLORS[s.status]}55`,
                  borderRadius: 8, padding: '5px 8px',
                  color: STATUS_COLORS[s.status], fontSize: 12,
                }}>{s.status}</span>
              )}

              {s.osoba === kim && s.status !== 'nagrane' && (
                <label style={{
                  background: '#0f2318', border: '1px solid #22c55e55',
                  borderRadius: 8, padding: '5px 12px',
                  color: '#22c55e', fontSize: 12, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  ✓ Oddaję
                  <input type="file" accept="audio/*" style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && oddaj(s.id, e.target.files[0])} />
                </label>
              )}

              {s.status === 'nagrane' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span style={{ fontSize: 11, color: '#22c55e', whiteSpace: 'nowrap' }}>✓ Nagrane</span>
                  {s.plik && <span style={{ fontSize: 10, color: '#4b5563' }}>📎 {s.plik}</span>}
                </div>
              )}

              {isAdmin && <button onClick={() => usun(s.id)} style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 16 }}>×</button>}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000aa', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111120', border: '1px solid #2d2d4e', borderRadius: 16, padding: 24, width: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Nowa scena</h2>
            <input value={nazwa} onChange={e => setNazwa(e.target.value)} onKeyDown={e => e.key === 'Enter' && dodajScene()} placeholder="Nazwa sceny / linii" autoFocus
              style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 10, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none' }} />
            <select value={osoba} onChange={e => setOsoba(e.target.value)}
              style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 10, padding: '10px 14px', color: osoba ? '#f0f0f0' : '#6b7280', fontSize: 14, outline: 'none' }}>
              <option value=''>Przypisz osobę (opcjonalnie)</option>
              {ekipa.map(e => <option key={e.id} value={e.nick}>{e.nick} — {e.rola}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: '1px solid #2d2d4e', borderRadius: 8, padding: '8px 16px', color: '#6b7280', cursor: 'pointer' }}>Anuluj</button>
              <button onClick={dodajScene} style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Dodaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
