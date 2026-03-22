import { render, screen } from '@testing-library/react'
import { MessageThread } from '@/components/messages/MessageThread'
import { describe, it, expect } from 'vitest'

const mockMessages = [
  {
    id: 'msg-1',
    sender_id: 'user-1',
    receiver_id: 'user-2',
    content: '你好，我对你的项目很感兴趣',
    is_read: true,
    created_at: new Date().toISOString(),
  },
]

describe('MessageThread', () => {
  it('显示消息内容', () => {
    render(
      <MessageThread
        messages={mockMessages}
        currentUserId="user-1"
        otherUser={{ id: 'user-2', full_name: '张三', avatar_url: null } as any}
        onSend={async () => {}}
      />
    )
    expect(screen.getByText('你好，我对你的项目很感兴趣')).toBeTruthy()
  })
})
