'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

function LoginForm() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const next = searchParams.get('next') ?? '/profile'
  const [loading, setLoading] = useState(false)

  const handleGithubLogin = async () => {
    setLoading(true)
    const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`
    console.log('[Login] 开始 OAuth，redirectTo =', redirectTo)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo,
        scopes: 'read:user user:email',
      },
    })

    console.log('[Login] signInWithOAuth 返回 data =', JSON.stringify(data), 'error =', error?.message ?? null)

    if (error) {
      console.error('[Login] OAuth 启动失败:', error.message)
      setLoading(false)
    }
    // 成功时不 setLoading(false)，保持 loading 直到页面跳转
  }

  return (
    <>
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm text-center">
          登录失败，请重试（错误：{error}）
        </div>
      )}
      <Button
        className="w-full"
        size="lg"
        onClick={handleGithubLogin}
        disabled={loading}
      >
        <Github className="mr-2 h-5 w-5" />
        {loading ? '跳转中...' : '用 GitHub 登录'}
      </Button>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">JoinTri</h1>
          <p className="text-muted-foreground">
            找到你的三人组，一起出发
          </p>
        </div>
        <Suspense fallback={
          <Button className="w-full" size="lg" disabled>
            <Github className="mr-2 h-5 w-5" />
            用 GitHub 登录
          </Button>
        }>
          <LoginForm />
        </Suspense>
        <p className="text-center text-xs text-muted-foreground">
          登录即代表你同意我们的服务条款
        </p>
      </div>
    </div>
  )
}
