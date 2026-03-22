import { NextResponse } from 'next/server'

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
