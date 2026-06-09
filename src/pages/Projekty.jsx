import { useState } from 'react'
import { notify } from '../webhook'
import SceneView from '../components/SceneView'

const STATUSY = ['w trakcie', 'pauza', 'gotowe']
const STATUS_COLORS = { 'w trakcie': '#22c55e', 'pauza': '#f59e0b', 'gotowe': '#6b7280' }

function load() { return JSON.parse(localStorage.getItem('ns_projekty') || '[]') }
function save(d) { localStorage.setItem('ns_projekty', JSON.stringify(d)) }
function loadSceny(pid) { return JSON.parse(localStorage.getItem(`ns_sceny_${pid}`) || '[]') }

function getPostep(pid) {
  const sceny = loadSceny(pid)
  if (!sceny.length) return 0
  return Math.round((sceny.filter(s => s.status === 'nagrane').length / sceny.length) * 100)
}

export default function Projekty({ user }) {
  const isAdmin = user?.isAdmin
  const [projekty, setProjekty] = useState(load)
  const [modal, setModal] = useState(false)
  const [nazwa, setNazwa] = useState('')
  const [status, setStatus] = useState('w trakcie')
  const [otwarty, setOtwarty] = useState(null)
  const [studioPauza, setStudioPauza] = useState(
    localStorage.getItem('ns_studio_pauza') === 'true'
  )

  function dodaj() {
    if (!nazwa.trim()) return
    const nowe = [...projekty, { id: Date.now(), nazwa, status }]
    save(nowe)
    setProjekty(nowe)
    setNazwa('')
    setStatus('w trakcie')
    setModal(false)
  }

  function zmienStatus(id, nowy) {
    const updated = projekty.map(p => p.id === id ? { ...p, status: nowy } : p)
    save(updated)
    setProjekty(updated)
  }

  function usun(id) {
    const updated = projekty.filter(p => p.id !== id)
    save(updated)
    setProjekty(updated)
  }

  function toggleStudio() {
    const nowy = !studioPauza
    setStudioPauza(nowy)
    localStorage.setItem('ns_studio_pauza', nowy)
    if (nowy) {
      const updated = projekty.map(p => ({ ...p, status: 'pauza' }))
      save(updated)
      setProjekty(updated)
      notify.studioPauza()
    } else {
      notify.studioWznowienie()
    }
  }

  if (otwarty) {
    const proj = projekty.find(p => p.id === otwarty)
    return <SceneView projekt={proj} onBack={() => setOtwarty(null)} user={user} />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0f0' }}>Projekty</h1>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={toggleStudio} style={{
              background: studioPauza ? '#7f1d1d' : '#111120',
              border: `1px solid ${studioPauza ? '#ef4444' : '#2d2d4e'}`,
              borderRadius: 10, padding: '9px 16px',
              color: studioPauza ? '#fca5a5' : '#6b7280',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>
              {studioPauza ? '⏸ Studio na pauzie' : '▶ Studio aktywne'}
            </button>
            <button onClick={() => setModal(true)} style={{
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              border: 'none', borderRadius: 10, padding: '9px 18px',
              color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>+ Nowy projekt</button>
          </div>
        )}
      </div>

      {studioPauza && (
        <div style={{
          background: '#1c0a0a', border: '1px solid #7f1d1d',
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          color: '#fca5a5', fontSize: 13,
        }}>
          ⏸ Studio jest na pauzie — wszystkie projekty wstrzymane.
        </div>
      )}

      {projekty.length === 0 && (
        <p style={{ color: '#4b5563', textAlign: 'center', marginTop: 60, fontSize: 14 }}>Brak projektów. Dodaj pierwszy!</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {projekty.map(p => {
          const postep = getPostep(p.id)
          return (
            <div key={p.id} style={{
              background: '#111120', border: '1px solid #1e1e3a',
              borderRadius: 14, padding: '18px 16px', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
              onClick={() => setOtwarty(p.id)}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e3a'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: '#e2d9ff' }}>{p.nazwa}</span>
                {isAdmin && (
                  <button onClick={e => { e.stopPropagation(); usun(p.id) }} style={{
                    background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 16,
                  }}>×</button>
                )}
              </div>

              {/* postęp */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>Postęp</span>
                  <span style={{ fontSize: 11, color: '#a78bfa' }}>{postep}%</span>
                </div>
                <div style={{ height: 4, background: '#1e1e3a', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${postep}%`, background: 'linear-gradient(90deg, #7c3aed, #2563eb)', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
              </div>

              {isAdmin ? (
                <select
                  value={p.status}
                  onChange={e => { e.stopPropagation(); zmienStatus(p.id, e.target.value) }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: '#1a1a2e', border: `1px solid ${STATUS_COLORS[p.status]}44`,
                    borderRadius: 8, padding: '5px 10px',
                    color: STATUS_COLORS[p.status], fontSize: 12,
                    cursor: 'pointer', outline: 'none', width: '100%',
                  }}
                >
                  {STATUSY.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span style={{
                  display: 'block', background: '#1a1a2e', border: `1px solid ${STATUS_COLORS[p.status]}44`,
                  borderRadius: 8, padding: '5px 10px',
                  color: STATUS_COLORS[p.status], fontSize: 12, width: '100%', boxSizing: 'border-box',
                }}>{p.status}</span>
              )}
            </div>
          )
        })}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000aa', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111120', border: '1px solid #2d2d4e', borderRadius: 16, padding: 24, width: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Nowy projekt</h2>
            <input value={nazwa} onChange={e => setNazwa(e.target.value)} onKeyDown={e => e.key === 'Enter' && dodaj()} placeholder="Nazwa projektu" autoFocus
              style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 10, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none' }} />
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 10, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none' }}>
              {STATUSY.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: '1px solid #2d2d4e', borderRadius: 8, padding: '8px 16px', color: '#6b7280', cursor: 'pointer' }}>Anuluj</button>
              <button onClick={dodaj} style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Dodaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
