import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === project.owner_id

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.track && <Badge variant="outline">{project.track}</Badge>}
        </div>
        <p className="text-muted-foreground">{project.tagline}</p>
      </div>

      {project.description && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">招募角色</p>
        <div className="flex gap-2">
          {project.roles_needed.map((role: string) => (
            <Badge key={role}>{role}</Badge>
          ))}
        </div>
      </div>

      {project.profiles && (
        <div className="flex items-center gap-3 pt-2">
          <Avatar>
            <AvatarImage src={project.profiles.avatar_url ?? ''} />
            <AvatarFallback>{project.profiles.full_name?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{project.profiles.full_name}</p>
            <p className="text-xs text-muted-foreground">发起人</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!isOwner && user && (
          <Link href={`/messages/${project.owner_id}`} className={cn(buttonVariants())}>
            联系发起人
          </Link>
        )}
        {!user && (
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }))}>
            登录后联系
          </Link>
        )}
      </div>
    </div>
  )
}
