'use server'

import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/lib/types'

export async function saveProfile(data: Partial<Profile>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function ensureProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata.full_name ?? null,
      avatar_url: user.user_metadata.avatar_url ?? null,
      github_username: user.user_metadata.user_name ?? null,
      roles: [],
      skills: [],
      tracks: [],
    })

    const { data: newProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    return newProfile
  }

  return profile
}
