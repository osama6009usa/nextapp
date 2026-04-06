'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', fontFamily:'system-ui', direction:'rtl' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
      <h2 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>حدث خطأ</h2>
      <button onClick={reset} style={{ padding:'10px 24px', borderRadius:8,
        background:'#4F46E5', color:'#fff', border:'none', cursor:'pointer', fontSize:14 }}>
        حاول مجدداً
      </button>
    </div>
  )
}
