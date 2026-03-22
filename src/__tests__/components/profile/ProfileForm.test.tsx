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

  it('角色按钮点击后再次点击可取消选中', () => {
    const onSave = vi.fn()
    render(<ProfileForm profile={mockProfile} onSave={onSave} />)

    // CEO 初始未选中，点击选中
    const ceoButton = screen.getByRole('button', { name: 'CEO' })
    fireEvent.click(ceoButton)

    // 再次点击取消选中
    fireEvent.click(ceoButton)

    // 保存后验证 CEO 不在 roles 中（恢复为初始状态 ['CTO']）
    fireEvent.click(screen.getByRole('button', { name: /保存/i }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ roles: ['CTO'] })
    )
  })

  it('输入技能并点击添加后，技能出现在标签列表中', () => {
    render(<ProfileForm profile={mockProfile} onSave={vi.fn()} />)

    const skillInput = screen.getByPlaceholderText('输入技能后按 Enter')
    fireEvent.change(skillInput, { target: { value: 'Vue' } })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))

    expect(screen.getByText(/Vue\s*×/)).toBeTruthy()
  })

  it('点击技能标签可将其从列表中移除', () => {
    render(<ProfileForm profile={mockProfile} onSave={vi.fn()} />)

    // mockProfile.skills 包含 'React'，对应标签文本为 'React ×'
    const reactBadge = screen.getByText(/React\s*×/)
    expect(reactBadge).toBeTruthy()

    fireEvent.click(reactBadge)

    expect(screen.queryByText(/React\s*×/)).toBeNull()
  })
})
