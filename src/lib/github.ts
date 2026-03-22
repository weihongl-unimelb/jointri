export interface GithubStats {
  repos_count: number
  stars_count: number
  last_active: string | null
}

export async function fetchGithubStats(username: string): Promise<GithubStats | null> {
  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  })
  if (!userRes.ok) return null

  const user = await userRes.json()

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    { headers: { Accept: 'application/vnd.github.v3+json' } }
  )
  const repos = reposRes.ok ? await reposRes.json() : []
  const stars_count = repos.reduce(
    (sum: number, r: { stargazers_count: number }) => sum + r.stargazers_count,
    0
  )

  return {
    repos_count: user.public_repos,
    stars_count,
    last_active: user.updated_at ?? null,
  }
}
