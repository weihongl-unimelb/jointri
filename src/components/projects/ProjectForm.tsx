'use client'
import { useState } from 'react'
import { Project, Role } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const ROLE_OPTIONS: Role[] = ['CEO', 'CTO', 'CMO']
const TRACK_OPTIONS = ['AI', 'SaaS', '工具', '消费品', '教育', '医疗', '其他']

interface Props {
  initialData?: Partial<Project>
  onSubmit: (data: Omit<Project, 'id' | 'owner_id' | 'created_at'>) => Promise<void>
}

export function ProjectForm({ initialData, onSubmit }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [tagline, setTagline] = useState(initialData?.tagline ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [track, setTrack] = useState(initialData?.track ?? '')
  const [rolesNeeded, setRolesNeeded] = useState<Role[]>(initialData?.roles_needed ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const toggleRole = (role: Role) => {
    setRolesNeeded(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const handleSubmit = async () => {
    if (!title || !tagline || rolesNeeded.length === 0) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({
        title, tagline,
        description: description || null,
        track: track || null,
        roles_needed: rolesNeeded,
        status: 'recruiting',
      })
    } catch {
      setSubmitError('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="title">项目名称 *</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="你的项目叫什么？" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">一句话介绍 *</Label>
        <Input id="tagline" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="用一句话吸引合适的人" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">详细描述</Label>
        <Textarea
          id="description"
          value={description ?? ''}
          onChange={e => setDescription(e.target.value)}
          placeholder="项目背景、你的进展、你在找什么样的搭档..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label>所属赛道</Label>
        <div className="flex flex-wrap gap-2">
          {TRACK_OPTIONS.map(t => (
            <Button
              key={t}
              type="button"
              variant={track === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTrack(prev => prev === t ? '' : t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>招募哪些角色？*</Label>
        <div className="flex gap-2">
          {ROLE_OPTIONS.map(role => (
            <Button
              key={role}
              type="button"
              variant={rolesNeeded.includes(role) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleRole(role)}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <Button
        onClick={handleSubmit}
        disabled={submitting || !title || !tagline || rolesNeeded.length === 0}
      >
        {submitting ? '发布中...' : '发布项目'}
      </Button>
    </div>
  )
}
