'use client'
import { useState } from 'react'
import { Profile } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Github, Star, BookOpen, RefreshCw, Clock } from 'lucide-react'

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '未知'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月前`
  return `${Math.floor(months / 12)} 年前`
}

export function GithubStats({ profile }: { profile: Profile }) {
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setSyncError(null)
    try {
      const res = await fetch('/api/github/sync', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setSyncError(data.error ?? '同步失败，请稍后重试')
      } else {
        window.location.reload()
      }
    } catch {
      setSyncError('网络错误，请稍后重试')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Github className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">@{profile.github_username}</span>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {profile.github_repos_count ?? '-'} repos
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {profile.github_stars_count ?? '-'} stars
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatRelativeTime(profile.github_last_active ?? null)}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {syncError && (
          <p className="mt-2 text-sm text-destructive">{syncError}</p>
        )}
      </CardContent>
    </Card>
  )
}
