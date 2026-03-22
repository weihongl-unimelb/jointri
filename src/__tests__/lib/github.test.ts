import { describe, it, expect, vi } from 'vitest'
import { fetchGithubStats } from '@/lib/github'

global.fetch = vi.fn()

describe('fetchGithubStats', () => {
  it('成功时返回仓库数和 star 数', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        public_repos: 25,
        updated_at: '2025-01-01T00:00:00Z',
      }),
    } as Response)

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { stargazers_count: 10 },
        { stargazers_count: 5 },
      ]),
    } as Response)

    const result = await fetchGithubStats('testuser')
    expect(result!.repos_count).toBe(25)
    expect(result!.stars_count).toBe(15)
  })

  it('请求失败时返回 null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)
    const result = await fetchGithubStats('notfound')
    expect(result).toBeNull()
  })
})
