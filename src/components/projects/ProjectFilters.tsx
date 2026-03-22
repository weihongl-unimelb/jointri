'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Role } from '@/lib/types'

const ROLES: Role[] = ['CEO', 'CTO', 'CMO']
const TRACKS = ['AI', 'SaaS', '工具', '消费品', '教育', '医疗']

function ProjectFiltersInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentRole = searchParams.get('role')
  const currentTrack = searchParams.get('track')

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/projects?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">缺少角色：</span>
        {ROLES.map(role => (
          <Button
            key={role}
            variant={currentRole === role ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('role', role)}
          >
            {role}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">赛道：</span>
        {TRACKS.map(track => (
          <Button
            key={track}
            variant={currentTrack === track ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('track', track)}
          >
            {track}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function ProjectFilters() {
  return (
    <Suspense fallback={<div className="h-20 bg-muted/20 rounded animate-pulse" />}>
      <ProjectFiltersInner />
    </Suspense>
  )
}
