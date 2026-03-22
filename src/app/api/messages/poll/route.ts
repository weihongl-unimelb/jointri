import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const otherUserId = searchParams.get('userId')
  const since = searchParams.get('since')

  if (!otherUserId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let query = supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(id, full_name, avatar_url)')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  if (since) {
    query = query.gt('created_at', since)
  }

  const { data: messages } = await query

  // 标记收到的消息为已读
  if (messages?.length) {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', otherUserId)
      .eq('is_read', false)
  }

  return NextResponse.json({ messages: messages ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let receiverId: string, content: string
  try {
    const body = await request.json()
    receiverId = body.receiverId
    content = body.content
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: 'receiverId and content required' }, { status: 400 })
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ sender_id: user.id, receiver_id: receiverId, content: content.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message })
}
