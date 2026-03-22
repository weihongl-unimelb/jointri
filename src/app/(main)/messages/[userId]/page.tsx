import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MessageThread } from '@/components/messages/MessageThread'
import { sendMessage } from './actions'

export default async function ConversationPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: otherUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!otherUser) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(id, full_name, avatar_url)')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  // 把 sendMessage(receiverId, content) 部分应用为 (content) => Promise<void>
  const sendToUser = async (content: string) => {
    'use server'
    await sendMessage(userId, content)
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <div className="mb-4">
        <h2 className="font-semibold">{otherUser.full_name}</h2>
      </div>
      <MessageThread
        messages={messages ?? []}
        currentUserId={user.id}
        otherUser={otherUser}
        onSend={sendToUser}
      />
    </div>
  )
}
