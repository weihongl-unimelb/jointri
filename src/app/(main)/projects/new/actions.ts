'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Project } from '@/lib/types'

export async function createProject(data: Omit<Project, 'id' | 'owner_id' | 'created_at'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ ...data, owner_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (project) redirect(`/projects/${project.id}`)
}
