export type Role = 'CEO' | 'CTO' | 'CMO'
export type ProjectStatus = 'recruiting' | 'full' | 'closed'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  roles: Role[]
  skills: string[]
  tracks: string[]
  github_username: string | null
  github_repos_count: number | null
  github_stars_count: number | null
  github_last_active: string | null
  website_url: string | null
  created_at: string
}

export interface Project {
  id: string
  owner_id: string
  title: string
  tagline: string
  description: string | null
  track: string | null
  roles_needed: Role[]
  status: ProjectStatus
  created_at: string
  profiles?: Profile  // join 时带入
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: Profile
}
