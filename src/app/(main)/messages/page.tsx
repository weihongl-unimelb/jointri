import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConversationList } from '@/components/messages/ConversationList'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 取所有与当前用户相关的消息（按时间倒序）
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(id, full_name, avatar_url), receiver:profiles!receiver_id(id, full_name, avatar_url)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // 按对话方聚合，每个对话方取最新一条
  const conversationMap = new Map<string, {
    otherUser: any
    lastMessage: string
    lastTime: string
    unreadCount: number
  }>()

  for (const msg of messages ?? []) {
    const isSender = msg.sender_id === user.id
    const otherUser = isSender ? msg.receiver : msg.sender
    if (!otherUser) continue

    if (!conversationMap.has(otherUser.id)) {
      conversationMap.set(otherUser.id, {
        otherUser,
        lastMessage: msg.content,
        lastTime: new Date(msg.created_at).toLocaleDateString('zh-CN'),
        unreadCount: (!isSender && !msg.is_read) ? 1 : 0,
      })
    } else if (!isSender && !msg.is_read) {
      conversationMap.get(otherUser.id)!.unreadCount += 1
    }
  }

  const conversations = Array.from(conversationMap.values())

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
      <h1 className="text-2xl font-bold">消息</h1>
      <ConversationList conversations={conversations} />
    </div>
  )
}
