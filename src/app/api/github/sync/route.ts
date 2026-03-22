import { createClient } from '@/lib/supabase/server'
import { fetchGithubStats } from '@/lib/github'
import { NextResponse } from 'next/server'

const syncCooldowns = new Map<string, number>()
const COOLDOWN_MS = 60_000 // 60 秒

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 速率限制：每个用户每 60 秒只能同步一次
  const lastSync = syncCooldowns.get(user.id)
  if (lastSync && Date.now() - lastSync < COOLDOWN_MS) {
    const waitSecs = Math.ceil((COOLDOWN_MS - (Date.now() - lastSync)) / 1000)
    return NextResponse.json({ error: `请等待 ${waitSecs} 秒后再同步` }, { status: 429 })
  }
  syncCooldowns.set(user.id, Date.now())

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_username')
    .eq('id', user.id)
    .single()

  if (!profile?.github_username) {
    return NextResponse.json({ error: 'No GitHub username' }, { status: 400 })
  }

  const stats = await fetchGithubStats(profile.github_username)
  if (!stats) return NextResponse.json({ error: 'GitHub fetch failed' }, { status: 502 })

  const updates: Record<string, unknown> = {
    github_repos_count: stats.repos_count,
    github_last_active: stats.last_active,
  }
  if (stats.stars_count !== null) {
    updates.github_stars_count = stats.stars_count
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save stats' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, stats })
}
