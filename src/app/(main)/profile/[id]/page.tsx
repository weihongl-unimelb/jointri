import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GithubStats } from '@/components/profile/GithubStats'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwn = user?.id === id

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ?? ''} />
          <AvatarFallback className="text-xl">{profile.full_name?.[0] ?? '?'}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{profile.full_name ?? '未填写姓名'}</h1>
          {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
          <div className="flex flex-wrap gap-1 pt-1">
            {profile.roles?.map((role: string) => (
              <Badge key={role}>{role}</Badge>
            ))}
          </div>
        </div>
      </div>

      {profile.github_username && <GithubStats profile={profile} />}

      {profile.skills?.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">技能</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>
      )}

      {profile.tracks?.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">偏好赛道</h3>
          <div className="flex flex-wrap gap-2">
            {profile.tracks.map((track: string) => (
              <Badge key={track} variant="outline">{track}</Badge>
            ))}
          </div>
        </div>
      )}

      {profile.website_url && (
        <a
          href={profile.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          {profile.website_url}
        </a>
      )}

      <div className="pt-2 flex gap-2">
        {isOwn ? (
          <Link href="/profile" className={cn(buttonVariants({ variant: 'outline' }))}>
            编辑档案
          </Link>
        ) : user ? (
          <Link href={`/messages/${profile.id}`} className={cn(buttonVariants({ variant: 'default' }))}>
            发消息
          </Link>
        ) : (
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }))}>
            登录后联系
          </Link>
        )}
      </div>
    </div>
  )
}
