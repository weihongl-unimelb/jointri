'use client'
import { useState } from 'react'
import { Profile } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Github, Star, BookOpen, RefreshCw } from 'lucide-react'

export function GithubStats({ profile }: { profile: Profile }) {
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      await fetch('/api/github/sync', { method: 'POST' })
      window.location.reload()
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
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
