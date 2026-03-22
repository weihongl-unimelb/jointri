import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { GithubStats } from '@/components/profile/GithubStats'
import { ensureProfile, saveProfile } from './actions'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await ensureProfile()

  if (!profile) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-bold">我的档案</h1>
      {profile.github_username && <GithubStats profile={profile} />}
      <ProfileForm profile={profile} onSave={saveProfile} />
    </div>
  )
}
