import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  // غير مسجل → login
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // مسجل
  if (user) {
    // login → تحقق من profile
    if (pathname === '/login') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_complete')
        .eq('id', user.id)
        .single()
      if (profile?.is_complete) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/profile/setup', request.url))
      }
    }

    // أي صفحة غير login وغير setup → تحقق من is_complete
    if (pathname !== '/profile/setup') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_complete')
        .eq('id', user.id)
        .single()
      if (!profile?.is_complete) {
        return NextResponse.redirect(new URL('/profile/setup', request.url))
      }
    }

    // profile مكتمل وحاول يفتح setup → dashboard
    if (pathname === '/profile/setup') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_complete')
        .eq('id', user.id)
        .single()
      if (profile?.is_complete) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
