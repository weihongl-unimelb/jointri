import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Profile } from '@/lib/types'

interface Conversation {
  otherUser: Profile
  lastMessage: string
  lastTime: string
  unreadCount: number
}

export function ConversationList({ conversations }: { conversations: Conversation[] }) {
  if (!conversations.length) {
    return (
      <p className="text-center text-muted-foreground py-16">
        还没有消息，去项目墙找感兴趣的项目吧 💬
      </p>
    )
  }

  return (
    <div className="divide-y">
      {conversations.map(({ otherUser, lastMessage, lastTime, unreadCount }) => (
        <Link
          key={otherUser.id}
          href={`/messages/${otherUser.id}`}
          className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
        >
          <Avatar>
            <AvatarImage src={otherUser.avatar_url ?? ''} />
            <AvatarFallback>{otherUser.full_name?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium">{otherUser.full_name}</span>
              <span className="text-xs text-muted-foreground">{lastTime}</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
