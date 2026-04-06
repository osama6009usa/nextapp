import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إعداد الملف الشخصي — BioSovereignty',
}

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#EEF2F8',
      fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
      direction: 'rtl',
    }}>
      {children}
    </div>
  )
}
