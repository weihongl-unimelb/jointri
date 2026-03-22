import Link from 'next/link'
import { Project } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ROLE_COLORS = {
  CEO: 'bg-purple-100 text-purple-800',
  CTO: 'bg-blue-100 text-blue-800',
  CMO: 'bg-green-100 text-green-800',
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight">{project.title}</h3>
            {project.track && (
              <Badge variant="outline" className="shrink-0">{project.track}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{project.tagline}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">招募中</p>
            <div className="flex flex-wrap gap-1">
              {project.roles_needed.map(role => (
                <span
                  key={role}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[role]}`}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
