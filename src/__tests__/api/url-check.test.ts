import { describe, it, expect, vi } from 'vitest'

// 与 route.ts 共享的纯函数
async function checkUrlReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
    return res.ok
  } catch {
    return false
  }
}

global.fetch = vi.fn()

describe('checkUrlReachable', () => {
  it('URL 可访问时返回 true', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)
    expect(await checkUrlReachable('https://example.com')).toBe(true)
  })

  it('URL 不可访问时返回 false', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))
    expect(await checkUrlReachable('https://notexist.example')).toBe(false)
  })
})
