'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(`خطأ: ${error.message}`)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#EEF2F8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl',
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: '14px', padding: '40px 36px',
        width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(15,22,41,0.10)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 52, height: 52, background: '#4F46E5', borderRadius: 14,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0F1629' }}>BioSovereignty</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>سيادتك الحيوية — مرحباً بعودتك</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>البريد الإلكتروني</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="doctor@biosov.ai"
              style={{
                width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB',
                borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box',
                background: '#F9FAFB', direction: 'ltr', textAlign: 'left',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>كلمة المرور</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB',
                borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box',
                background: '#F9FAFB', direction: 'ltr', textAlign: 'left',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#DC2626', textAlign: 'center',
            }}>{error}</div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{
              background: loading ? '#A5B4FC' : '#4F46E5', color: 'white',
              border: 'none', borderRadius: 10, padding: '13px',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: (!email || !password) ? 0.6 : 1,
            }}
          >
            {loading ? '⏳ جارٍ الدخول...' : '→ دخول'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 24, marginBottom: 0 }}>
          🔒 نظام خاص — Supabase Self-Hosted على سيرفرك
        </p>
      </div>
    </div>
  )
}
