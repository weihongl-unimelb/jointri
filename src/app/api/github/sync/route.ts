import { createClient } from '@/lib/supabase/server'
import { fetchGithubStats } from '@/lib/github'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  await supabase.from('profiles').update({
    github_repos_count: stats.repos_count,
    github_stars_count: stats.stars_count,
    github_last_active: stats.last_active,
  }).eq('id', user.id)

  return NextResponse.json({ ok: true, stats })
}
