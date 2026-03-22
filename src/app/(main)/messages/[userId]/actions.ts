'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMessage(receiverId: string, content: string) {
  if (!content?.trim()) return { error: '消息内容不能为空' }
  if (content.length > 2000) return { error: '消息不能超过 2000 字' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
    })

  if (error) return { error: error.message }
  return { success: true }
}
