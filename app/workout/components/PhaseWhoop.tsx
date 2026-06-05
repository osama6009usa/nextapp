'use client'
import { useRef, useState } from 'react'

interface Props {
  ar: boolean
  onUpload: (base64: string) => void
  onSkip: () => void
  isLoading: boolean
}

export default function PhaseWhoop({ ar, onUpload, onSkip, isLoading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      const base64 = result.split(',')[1]
      setPreview(result)
      onUpload(base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0', textAlign: 'center' }}>

      {/* Header */}
      <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,#1C1C1E,#2C2C2E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>⌚</div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--t1,#0D1B2A)', marginBottom: 6 }}>
          {ar ? 'أحسنت! 💪 رفع صورة WHOOP' : 'Great workout! 💪 Upload WHOOP'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--t2,#5A6A82)', maxWidth: 300 }}>
          {ar
            ? 'التقط screenshot من تطبيق WHOOP يظهر Strain Score و HRV — Claude سيحلل الأداء'
            : 'Take a screenshot from WHOOP app showing Strain Score & HRV — Claude will analyze performance'}
        </div>
      </div>

      {/* Drop zone */}
      {!isLoading && !preview && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onClick={() => inputRef.current?.click()}
          style={{ width: '100%', maxWidth: 360, minHeight: 160, border: `2px dashed ${dragging ? '#7C3AED' : 'rgba(30,50,90,0.15)'}`, borderRadius: 14, background: dragging ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .2s' }}
        >
          <div style={{ fontSize: 32 }}>📱</div>
          <div style={{ fontSize: 12, color: 'var(--t2,#5A6A82)' }}>
            {ar ? 'اسحب الصورة هنا أو اضغط للاختيار' : 'Drop image here or click to select'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--t3,#94A3B8)' }}>PNG, JPG, HEIC</div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
      )}

      {/* Preview */}
      {preview && !isLoading && (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: 280 }}>
          <img src={preview} alt="WHOOP" style={{ width: '100%', display: 'block' }} />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 60, height: 60 }}>
            <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(124,58,237,0.15)', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <div style={{ position: 'absolute', inset: 8, border: '2px solid rgba(0,168,122,0.15)', borderTopColor: '#00A87A', borderRadius: '50%', animation: 'spin 1.2s linear infinite reverse' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2,#5A6A82)' }}>
            {ar ? 'Claude يحلل صورة WHOOP ويقارن مع أدائك...' : 'Claude is analyzing your WHOOP data vs performance...'}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!preview && !isLoading && (
        <div style={{ width: '100%', maxWidth: 360, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(30,50,90,0.08)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3,#94A3B8)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8 }}>
            {ar ? 'كيف تأخذ الصورة من WHOOP' : 'How to screenshot WHOOP'}
          </div>
          {[
            ar ? '1. افتح تطبيق WHOOP' : '1. Open WHOOP app',
            ar ? '2. اذهب لـ Recovery أو Today tab' : '2. Go to Recovery or Today tab',
            ar ? '3. التقط screenshot يظهر Strain + HRV' : '3. Screenshot showing Strain + HRV',
            ar ? '4. ارفعها هنا' : '4. Upload it here',
          ].map((step, i) => (
            <div key={i} style={{ fontSize: 11, color: 'var(--t2,#5A6A82)', padding: '3px 0', borderBottom: i < 3 ? '1px solid rgba(30,50,90,0.06)' : 'none' }}>{step}</div>
          ))}
        </div>
      )}

      {/* Skip */}
      {!isLoading && (
        <button
          onClick={onSkip}
          style={{ padding: '9px 20px', borderRadius: 9, background: 'transparent', border: '1px solid rgba(30,50,90,0.12)', color: 'var(--t2,#5A6A82)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}
        >
          {ar ? 'تخطي — عرض الملخص' : 'Skip — View Summary'}
        </button>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
