'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LogoutButtonProps {
  variant?: 'sidebar' | 'inline' | 'icon'
}

export function LogoutButton({ variant = 'sidebar' }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        title="تسجيل خروج"
        style={{
          background: 'transparent', border: 'none',
          cursor: 'pointer', padding: 8, borderRadius: 8,
          color: '#EF4444', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
      </button>
    )
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'transparent',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '10px 16px',
          color: '#F87171', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', width: '100%',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          direction: 'rtl',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
        {loading ? 'جارٍ الخروج...' : 'تسجيل خروج'}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#FEF2F2', border: '1px solid #FECACA',
        borderRadius: 8, padding: '8px 14px',
        color: '#DC2626', fontSize: 13, fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        direction: 'rtl',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
      {loading ? 'جارٍ الخروج...' : 'تسجيل خروج'}
    </button>
  )
}
