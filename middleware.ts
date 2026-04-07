import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // استثناء كامل لكل مسارات setup و api و static
  const isSetup  = pathname.startsWith('/profile/setup') || pathname.startsWith('/setup')
  const isLogin  = pathname === '/login'
  const isPublic = isLogin || isSetup || pathname.startsWith('/api')

  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // غير مسجل → login فقط
  if (!user) {
    if (isPublic) return supabaseResponse
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // مسجل — جلب profile مرة واحدة فقط
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_complete, goals_completed_at')
    .eq('id', user.id)
    .single()

  const profileDone = !!profile?.is_complete
  const goalsDone   = !!profile?.goals_completed_at

  // login → وجّه حسب الحالة
  if (isLogin) {
    if (!profileDone) return NextResponse.redirect(new URL('/profile/setup', request.url))
    if (!goalsDone)   return NextResponse.redirect(new URL('/profile/setup/goals', request.url))
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // صفحات setup — اتركها تعمل بحرية
  if (isSetup) return supabaseResponse

  // باقي الصفحات (dashboard وغيره) → تحقق من اكتمال الإعداد
  if (isPublic) return supabaseResponse
  if (!profileDone) return NextResponse.redirect(new URL('/profile/setup', request.url))
  if (!goalsDone)   return NextResponse.redirect(new URL('/profile/setup/goals', request.url))

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

