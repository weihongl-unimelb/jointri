'use client'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()

  const handleGithubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: 'read:user user:email',
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">JoinTri</h1>
          <p className="text-muted-foreground">
            找到你的三人组，一起出发
          </p>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={handleGithubLogin}
        >
          <Github className="mr-2 h-5 w-5" />
          用 GitHub 登录
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          登录即代表你同意我们的服务条款
        </p>
      </div>
    </div>
  )
}
