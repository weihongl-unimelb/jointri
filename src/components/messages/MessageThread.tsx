'use client'
import { useState, useEffect, useRef } from 'react'
import { Message, Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Props {
  messages: Message[]
  currentUserId: string
  otherUser: Profile
  onSend: (content: string) => Promise<void>
}

export function MessageThread({ messages: initial, currentUserId, otherUser, onSend }: Props) {
  const [messages, setMessages] = useState(initial)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 请求浏览器通知权限
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [])

  // 轮询新消息，每 3 秒一次
  useEffect(() => {
    const poll = async () => {
      try {
        const last = messages[messages.length - 1]
        const since = last?.created_at ?? new Date(0).toISOString()
        const res = await fetch(`/api/messages/poll?userId=${otherUser.id}&since=${encodeURIComponent(since)}`)
        if (!res.ok) return
        const { messages: newMsgs } = await res.json()
        if (newMsgs?.length) {
          setMessages(prev => [...prev, ...newMsgs])
          // 页面不在前台时推送通知
          if (document.hidden && Notification.permission === 'granted') {
            new Notification(`${otherUser.full_name} 发来新消息`, {
              body: newMsgs[newMsgs.length - 1].content,
              icon: otherUser.avatar_url ?? '/favicon.ico',
            })
          }
        }
      } catch {
        // 轮询失败静默忽略，不中断 interval
      }
    }
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [messages, otherUser.id, otherUser.full_name, otherUser.avatar_url])

  // 滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    setSending(true)
    setSendError(null)
    try {
      await onSend(input.trim())
      setInput('')
    } catch {
      setSendError('发送失败，请重试')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={cn('flex gap-2', isMine && 'flex-row-reverse')}>
              {!isMine && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={otherUser.avatar_url ?? ''} />
                  <AvatarFallback>{otherUser.full_name?.[0]}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
                  isMine
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                )}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      {sendError && (
        <p className="text-xs text-red-500 px-4 pb-1">{sendError}</p>
      )}
      <div className="border-t p-4 flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="发送消息..."
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !input.trim()}>
          发送
        </Button>
      </div>
    </div>
  )
}
