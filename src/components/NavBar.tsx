import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { SignOutButton } from '@/components/SignOutButton'

export async function NavBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/projects" className="font-bold text-xl">
          JoinTri
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            项目墙
          </Link>
          {user ? (
            <>
              <Link href="/messages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                消息
              </Link>
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url ?? ''} />
                  <AvatarFallback>{profile?.full_name?.[0] ?? '?'}</AvatarFallback>
                </Avatar>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className={cn(buttonVariants({ size: 'sm' }))}>
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
