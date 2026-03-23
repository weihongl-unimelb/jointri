import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  console.log('[Callback] 收到请求，code =', code ? '存在' : '缺失', 'next =', next, 'appUrl =', appUrl)

  if (code) {
    const response = NextResponse.redirect(`${appUrl}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            console.log('[Callback] 写入 cookies:', cookiesToSet.map(c => c.name))
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[Callback] exchangeCodeForSession，user =', data?.user?.id ?? null, 'error =', error?.message ?? null)

    if (!error) {
      console.log('[Callback] 登录成功，重定向到', `${appUrl}${next}`)
      return response
    }

    console.error('[Callback] exchangeCodeForSession 失败:', error.message)
  }

  console.warn('[Callback] 无 code 或 exchange 失败，重定向到登录页')
  return NextResponse.redirect(`${appUrl}/login?error=auth_failed`)
}
