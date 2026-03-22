import { render, screen } from '@testing-library/react'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { describe, it, expect } from 'vitest'

const mockProject = {
  id: 'proj-1',
  owner_id: 'user-1',
  title: 'AI 写作助手',
  tagline: '帮助独立创作者提升效率',
  description: null,
  track: 'AI',
  roles_needed: ['CMO'] as const,
  status: 'recruiting' as const,
  created_at: new Date().toISOString(),
}

describe('ProjectCard', () => {
  it('显示项目标题和 tagline', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText('AI 写作助手')).toBeTruthy()
    expect(screen.getByText('帮助独立创作者提升效率')).toBeTruthy()
  })

  it('显示缺失角色标签', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText('CMO')).toBeTruthy()
  })
})
