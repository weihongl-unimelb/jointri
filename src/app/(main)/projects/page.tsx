import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ role?: string; track?: string }>
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { role, track } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select('*, profiles(*)')
    .eq('status', 'recruiting')
    .order('created_at', { ascending: false })

  if (role) {
    query = query.contains('roles_needed', [role])
  }
  if (track) {
    query = query.eq('track', track)
  }

  const { data: projects } = await query

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">项目墙</h1>
        <Link href="/projects/new" className={cn(buttonVariants())}>发布项目</Link>
      </div>
      <ProjectFilters />
      {!projects?.length ? (
        <p className="text-center text-muted-foreground py-16">
          还没有项目，来发布第一个吧 🚀
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
