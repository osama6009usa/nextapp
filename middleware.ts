import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, options) {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          req.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname

  // ── المسارات العامة ──
  const publicPaths = ['/login', '/register', '/forgot-password']
  if (publicPaths.includes(path)) {
    if (session) return NextResponse.redirect(new URL('/dashboard', req.url))
    return res
  }

  // ── غير مسجّل → login ──
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // ── مسارات الإعداد — لا تحتاج profile مكتمل ──
  if (path.startsWith('/profile/setup')) {
    return res
  }

  // ── تحقق من اكتمال الـ profile ──
  const { data: profile } = await supabase
    .from('profiles')
    .select('setup_completed')
    .eq('id', session.user.id)
    .single()

  if (!profile?.setup_completed) {
    return NextResponse.redirect(new URL('/profile/setup/step1', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
