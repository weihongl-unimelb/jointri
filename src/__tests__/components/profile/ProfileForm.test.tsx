import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { describe, it, expect, vi } from 'vitest'

const mockProfile = {
  id: 'user-1',
  username: 'testuser',
  full_name: 'Test User',
  bio: '',
  roles: ['CTO'] as const,
  skills: ['React'],
  tracks: ['AI'],
  github_username: 'testuser',
  github_repos_count: 10,
  github_stars_count: 50,
  github_last_active: null,
  avatar_url: null,
  website_url: null,
  created_at: new Date().toISOString(),
}

describe('ProfileForm', () => {
  it('渲染时显示已有档案数据', () => {
    render(<ProfileForm profile={mockProfile} onSave={vi.fn()} />)
    expect(screen.getByDisplayValue('Test User')).toBeTruthy()
  })

  it('提交时调用 onSave 并传入更新后的数据', async () => {
    const onSave = vi.fn()
    render(<ProfileForm profile={mockProfile} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: /保存/i }))
    expect(onSave).toHaveBeenCalledTimes(1)
  })
})
