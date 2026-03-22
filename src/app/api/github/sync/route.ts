import { createClient } from '@/lib/supabase/server'
import { fetchGithubStats } from '@/lib/github'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_username, updated_at')
    .eq('id', user.id)
    .single()

  if (!profile?.github_username) {
    return NextResponse.json({ error: 'No GitHub username' }, { status: 400 })
  }

  // 速率限制：基于 profile.updated_at，60 秒冷却（Serverless 兼容）
  if (profile.updated_at) {
    const lastUpdate = new Date(profile.updated_at).getTime()
    const cooldownMs = 60_000
    if (Date.now() - lastUpdate < cooldownMs) {
      const waitSecs = Math.ceil((cooldownMs - (Date.now() - lastUpdate)) / 1000)
      return NextResponse.json({ error: `请等待 ${waitSecs} 秒后再同步` }, { status: 429 })
    }
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
