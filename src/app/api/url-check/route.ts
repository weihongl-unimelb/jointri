import { NextResponse } from 'next/server'

/**
 * 检查 hostname 是否为内网/保留地址（SSRF 防护）
 */
function isPrivateHostname(hostname: string): boolean {
  // 拒绝 localhost 变体
  if (hostname === 'localhost' || hostname === '0.0.0.0') return true

  // 拒绝 IPv6 本地地址
  if (hostname === '::1' || hostname.startsWith('[::1]')) return true

  // 解析 IPv4 地址
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4Match) {
    const [, a, b, c] = ipv4Match.map(Number)
    // 127.0.0.0/8 - loopback
    if (a === 127) return true
    // 10.0.0.0/8 - private
    if (a === 10) return true
    // 172.16.0.0/12 - private
    if (a === 172 && b >= 16 && b <= 31) return true
    // 192.168.0.0/16 - private
    if (a === 192 && b === 168) return true
    // 169.254.0.0/16 - link-local (AWS IMDS!)
    if (a === 169 && b === 254) return true
    // 0.0.0.0/8
    if (a === 0) return true
    // 100.64.0.0/10 - carrier-grade NAT
    if (a === 100 && b >= 64 && b <= 127) return true
  }

  return false
}

export async function POST(request: Request) {
  let url: string
  try {
    const body = await request.json()
    url = body.url
  } catch {
    return NextResponse.json({ reachable: false, error: 'Invalid request' }, { status: 400 })
  }

  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ reachable: false, error: 'Invalid URL' })
  }

  // 解析 hostname 并检查 SSRF
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return NextResponse.json({ reachable: false, error: 'Invalid URL format' })
  }

  if (isPrivateHostname(parsedUrl.hostname)) {
    return NextResponse.json(
      { reachable: false, error: 'Private or reserved addresses are not allowed' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    })
    return NextResponse.json({ reachable: res.ok })
  } catch {
    return NextResponse.json({ reachable: false })
  }
}
