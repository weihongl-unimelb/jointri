'use server'

import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/lib/types'

export async function saveProfile(data: Partial<Profile>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 显式白名单，防止用户篡改只读字段（github_repos_count 等）
  const { full_name, bio, roles, skills, tracks, website_url } = data

  // website_url 协议校验，防止 javascript: 等存储型 XSS
  if (website_url && !/^https?:\/\//i.test(website_url)) {
    return { error: '网址格式不合法，请以 http:// 或 https:// 开头' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, bio, roles, skills, tracks, website_url })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function ensureProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 用 upsert 替代 insert + select，解决并发竞态，减少一次 RTT
  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: user.user_metadata.full_name ?? null,
        avatar_url: user.user_metadata.avatar_url ?? null,
        github_username: user.user_metadata.user_name ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    .select()
    .single()

  if (error) {
    // upsert 忽略重复时 error 为 null，正常情况；其他错误记录日志，回退到直接查询
    console.error('[ensureProfile] upsert error:', error)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    return existingProfile
  }

  return profile
}
