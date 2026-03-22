'use client'
import { useState } from 'react'
import { Profile, Role } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

const ROLE_OPTIONS: Role[] = ['CEO', 'CTO', 'CMO']
const TRACK_OPTIONS = ['AI', 'SaaS', '工具', '消费品', '教育', '医疗', '其他']

interface Props {
  profile: Profile
  onSave: (data: Partial<Profile>) => Promise<void | { error?: string; success?: boolean }>
}

export function ProfileForm({ profile, onSave }: Props) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [roles, setRoles] = useState<Role[]>(profile.roles ?? [])
  const [skills, setSkills] = useState<string[]>(profile.skills ?? [])
  const [skillInput, setSkillInput] = useState('')
  const [tracks, setTracks] = useState<string[]>(profile.tracks ?? [])
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url ?? '')
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const toggleRole = (role: Role) => {
    setRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const toggleTrack = (track: string) => {
    setTracks(prev =>
      prev.includes(track) ? prev.filter(t => t !== track) : [...prev, track]
    )
  }

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  const checkUrl = async () => {
    if (!websiteUrl) return
    setUrlStatus('checking')
    try {
      const res = await fetch('/api/url-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      })
      const { reachable } = await res.json()
      setUrlStatus(reachable ? 'ok' : 'fail')
    } catch {
      setUrlStatus('fail')
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const result = await onSave({ full_name: fullName, bio, roles, skills, tracks, website_url: websiteUrl })
      if (result && result.error) {
        setSaveError(result.error)
      } else {
        setSaveSuccess(true)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label>姓名</Label>
        <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="你的名字" />
      </div>

      <div className="space-y-2">
        <Label>一句话介绍</Label>
        <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="简单介绍一下自己" rows={3} />
      </div>

      <div className="space-y-2">
        <Label>你的角色（可多选）</Label>
        <div className="flex gap-2">
          {ROLE_OPTIONS.map(role => (
            <Button
              key={role}
              type="button"
              variant={roles.includes(role) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleRole(role)}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>技能标签</Label>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            placeholder="输入技能后按 Enter"
          />
          <Button type="button" variant="outline" onClick={addSkill}>添加</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map(skill => (
            <Badge
              key={skill}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeSkill(skill)}
            >
              {skill} ×
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>偏好赛道（可多选）</Label>
        <div className="flex flex-wrap gap-2">
          {TRACK_OPTIONS.map(track => (
            <Button
              key={track}
              type="button"
              variant={tracks.includes(track) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleTrack(track)}
            >
              {track}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>个人网站 / 作品链接</Label>
        <div className="flex gap-2">
          <Input
            value={websiteUrl}
            onChange={e => { setWebsiteUrl(e.target.value); setUrlStatus('idle') }}
            placeholder="https://..."
          />
          <Button
            type="button"
            variant="outline"
            onClick={checkUrl}
            disabled={!websiteUrl || urlStatus === 'checking'}
          >
            {urlStatus === 'checking' ? '检查中...' : '验证链接'}
          </Button>
        </div>
        {urlStatus === 'ok' && <p className="text-xs text-green-600">✓ 链接有效</p>}
        {urlStatus === 'fail' && <p className="text-xs text-red-500">✗ 无法访问此链接</p>}
      </div>

      <Button onClick={handleSubmit} disabled={saving}>
        {saving ? '保存中...' : '保存档案'}
      </Button>

      {saveError && (
        <p className="text-sm text-red-600">{saveError}</p>
      )}
      {saveSuccess && (
        <p className="text-sm text-green-600">档案已保存</p>
      )}
    </div>
  )
}
